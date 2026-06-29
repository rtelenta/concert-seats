## Context

`SeatsService.holdSeats` transitions seats from `AVAILABLE` to `HELD` with `heldUntil = NOW() + INTERVAL '5 minutes'`, `heldBy = userId`, and `version + 1`. The hold is atomic (pessimistic_write lock + version guard). However, nothing releases seats when `heldUntil` passes — expired holds stay `HELD` forever, locking inventory.

The `SeatHoldExpired` event type and `SeatHoldExpiredPayload` (`{ showId, bookingId, seatIds }`) already exist in `@app/contracts`. The `TOPICS.SEATING = 'seating'` topic is defined. No `@nestjs/schedule` package is installed yet.

The current HTTP hold is user-initiated (`X-User-Id` header → `heldBy`). There is no `bookingId` concept in the seat model yet — the Booking saga that would carry real booking IDs does not exist. This gap is documented and out of scope for this change.

## Goals / Non-Goals

**Goals:**
- Release expired held seats back to `AVAILABLE` automatically via a periodic scheduler
- Emit one `SeatHoldExpired` event per `(showId, heldBy)` group to `TOPICS.SEATING`
- Reuse existing contracts, KafkaProducer, and the seats entity — no schema changes, no contract changes
- Keep the change to a single service (seating)

**Non-Goals:**
- Adding a `booking_id` column to the seats table (future change when the Booking saga is introduced)
- Building a transactional outbox (the scheduler commits the DB release, then best-effort emits events)
- Retry, DLQ, or idempotency for event emission (best-effort in this slice; hardening is a separate change)
- Confirming or selling seats (the `SOLD` transition is a separate flow)
- Changing the hold duration (stays at 5 minutes)

## Decisions

**1. Release via a single atomic `UPDATE ... RETURNING` query**

`SeatsService.releaseExpiredHolds()` executes:
```sql
UPDATE seats
SET status = 'AVAILABLE', held_by = NULL, held_until = NULL, version = version + 1
WHERE status = 'HELD' AND held_until < NOW()
RETURNING seat_id, show_id, held_by
```
This is atomic at the row level — no need for an explicit transaction or pessimistic lock. The `WHERE` clause is the guard: if a concurrent confirm/sell changes `status` before this runs, the row no longer matches and is not released. `RETURNING` gives us the released rows to group for event emission without a second query.

*Alternative considered:* SELECT-then-UPDATE with version check (matching `holdSeats`'s pattern). Rejected because it requires two queries and an explicit transaction for no additional safety — the single UPDATE with the `status = HELD` guard is already correct.

**2. Grouping: one event per (showId, heldBy)**

After the UPDATE...RETURNING, the released rows are grouped in-memory by `(showId, heldBy)`. For each group, one `SeatHoldExpired` envelope is emitted with `seatIds` = the array of released seat IDs in that group. This keeps events coarse-grained per hold-owner rather than per-seat.

**3. bookingId placeholder = heldBy**

`SeatHoldExpiredPayload` requires `bookingId: string`, but the seat model has no `bookingId`. Until the Booking saga introduces a `booking_id` column, the scheduler populates `bookingId` with `heldBy` (the userId). This is a documented semantic gap — consumers of `SeatHoldExpired` should treat `bookingId` as "the holder identity" until a future change adds real booking IDs.

*Alternative considered:* Make `bookingId` optional in the payload. Rejected because it changes the contract and all consumers for a temporary gap.

**4. Layer flow — scheduler as orchestrator in seats/services/, producer in messaging/producers/**

```
@Cron(*/30s) → SeatExpirationScheduler.tick()
  → SeatsService.releaseExpiredHolds()          [DB: UPDATE...RETURNING]
  → group released rows by (showId, heldBy)
  → for each group:
      SeatHoldExpiredProducer.emit(showId, heldBy, seatIds)
        → KafkaProducer.publish(TOPICS.SEATING, showId, envelope)
```

- `SeatExpirationScheduler` lives in `apps/seating/src/seats/services/seat-expiration.scheduler.ts` — a provider in `SeatsModule`. It injects `SeatsService` (DB) and `SeatHoldExpiredProducer` (Kafka).
- `SeatHoldExpiredProducer` lives in `apps/seating/src/messaging/producers/seat-hold-expired.producer.ts` — a provider in `MessagingModule`, exported for import by `SeatsModule`. It wraps `KafkaProducer` (from `KafkaModule`) and exposes a single `emit(showId, heldBy, seatIds)` method.
- `SeatsModule` imports `MessagingModule` to receive the producer. No circular dependency (MessagingModule does not import SeatsModule).

This follows the config rule: "Services never import kafkajs or messaging/* directly; they receive a producer injected via the module and call a named method on it."

**5. Cron interval: every 30 seconds**

`@Cron('*/30 * * * * *')` (6-field cron with seconds, as supported by `@nestjs/schedule`). The hold duration is 5 minutes, so a 30-second polling interval means a held seat is released within 30 seconds of expiration. This is tight enough for a concert booking flow and cheap enough for a single-row UPDATE.

**6. Error handling: best-effort event emission**

The DB release (`releaseExpiredHolds`) is committed first. Then events are emitted per group. If a publish fails for one group, the scheduler logs the error and continues with the next group — it does NOT roll back the DB release. This means a released seat might not have a corresponding `SeatHoldExpired` event. This is a known trade-off without a transactional outbox.

## Risks / Trade-offs

- [Released seat without event] → If Kafka is down when the scheduler runs, seats are released but no `SeatHoldExpired` event is emitted. Downstream consumers miss the event. Mitigated by: (a) the next tick re-releases only newly-expired seats (already-released ones are `AVAILABLE`), so no duplicate events; (b) a future transactional outbox change would pair the DB write with an outbox row. Acceptable for this slice.
- [bookingId = heldBy placeholder] → Consumers receiving `SeatHoldExpired` get a userId in `bookingId`, not a real booking ID. Mitigated by documenting the gap; a future change adds `booking_id` to the seat and the hold flow.
- [30-second latency] → A seat held at T expires at T+5min but may not be released until T+5min+30s. Acceptable for concert booking. If tighter latency is needed, reduce the interval or add an index on `(status, held_until)`.
- [No index on held_until] → The `UPDATE ... WHERE status='HELD' AND held_until < NOW()` scans all HELD rows. If the HELD set grows large, this becomes slow. Mitigated by the existing `IDX_seats_show_id` index and the fact that HELD seats are a small fraction of total seats. A future change can add a partial index on `held_until WHERE status = 'HELD'`.

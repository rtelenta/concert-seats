## Purpose

Define the scheduler contract that periodically releases expired seat holds back to the available pool and emits `SeatHoldExpired` events, including idempotency guarantees per tick.

## Requirements

### Requirement: Scheduler periodically releases expired seat holds
The seating service SHALL run a periodic scheduler (via `@nestjs/schedule` `@Cron` every 30 seconds) that calls `SeatsService.releaseExpiredHolds()` to find all seats with `status = HELD` and `held_until < NOW()`, transition them atomically back to `AVAILABLE`, clear `heldBy` and `heldUntil`, and increment `version` by 1. The release SHALL be conditioned on the current `version` to detect stale writes.

#### Scenario: Expired holds are released
- **WHEN** the scheduler fires and there are seats with `status = HELD` and `held_until < NOW()`
- **THEN** those seats are transitioned to `status = AVAILABLE`, `heldBy = null`, `heldUntil = null`, `version` is incremented by 1, and a `SeatHoldExpired` event is emitted for each `(showId, heldBy)` group

#### Scenario: No expired holds
- **WHEN** the scheduler fires and there are no seats with `status = HELD` and `held_until < NOW()`
- **THEN** no seats are modified and no events are emitted

#### Scenario: Hold not yet expired is left untouched
- **WHEN** the scheduler fires and a seat has `status = HELD` but `held_until >= NOW()`
- **THEN** that seat is not modified and no event is emitted for it

### Requirement: SeatHoldExpired events are emitted to the seating topic
For each group of released seats sharing the same `(showId, heldBy)`, the scheduler SHALL emit one `SeatHoldExpired` event envelope to the `seating` Kafka topic (`TOPICS.SEATING`), keyed by `showId`. The envelope payload SHALL conform to `SeatHoldExpiredPayload` from `@app/contracts` with `showId`, `bookingId` (set to `heldBy` as a placeholder until the Booking saga introduces real booking IDs), and `seatIds` (the array of released seat IDs in that group).

#### Scenario: One event per (showId, heldBy) group
- **WHEN** three seats for `show-1` held by `user-A` expire and two seats for `show-1` held by `user-B` expire
- **THEN** two `SeatHoldExpired` events are emitted to `TOPICS.SEATING`, both keyed by `show-1`: one with `bookingId = user-A` and `seatIds = [those 3 seats]`, one with `bookingId = user-B` and `seatIds = [those 2 seats]`

#### Scenario: Seats across different shows produce separate events
- **WHEN** seats for `show-1` and `show-2` held by `user-A` both expire
- **THEN** separate `SeatHoldExpired` events are emitted, keyed by their respective `showId`

#### Scenario: Event envelope follows the shared EventEnvelope shape
- **WHEN** a `SeatHoldExpired` event is emitted
- **THEN** the envelope has `eventId` (unique UUID), `eventType = 'SeatHoldExpired'`, `occurredAt` (ISO-8601), `correlationId` (unique UUID), `version: 1`, and `payload` matching `SeatHoldExpiredPayload`

### Requirement: Scheduler is idempotent per tick
Each scheduler tick SHALL be independent. If a seat is released in one tick, a subsequent tick SHALL NOT release it again (it is no longer `HELD`). If the scheduler crashes mid-tick, the next tick SHALL safely re-scan and release any remaining expired holds without emitting duplicate events for already-released seats.

#### Scenario: Already-released seat is not re-released
- **WHEN** a seat was released in a previous tick (now `status = AVAILABLE`) and the scheduler fires again
- **THEN** that seat is not selected (it no longer matches `status = HELD AND held_until < NOW()`) and no duplicate event is emitted
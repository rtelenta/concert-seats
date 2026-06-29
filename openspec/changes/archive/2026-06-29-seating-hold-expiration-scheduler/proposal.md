## Why

Seats held via `POST /shows/:showId/seats/hold` transition to `HELD` with a `heldUntil = NOW() + 5 minutes`, but nothing ever releases them when that deadline passes. Expired holds stay `HELD` forever, locking inventory that should return to `AVAILABLE`. A periodic scheduler is needed to detect expired holds, release them back to `AVAILABLE`, and emit a `SeatHoldExpired` event so downstream consumers (future Booking saga, read models, notifications) can react.

## What Changes

- Add a `SeatExpirationScheduler` provider in `apps/seating` that runs on a fixed cron interval (every 30 seconds) via `@nestjs/schedule`'s `@Cron` decorator
- Add a `releaseExpiredHolds` method to `SeatsService` that atomically selects all seats with `status = HELD AND held_until < NOW()`, transitions them back to `AVAILABLE`, clears `heldBy` and `heldUntil`, increments `version`, and returns the released seats grouped by `(showId, heldBy)`
- Add a `SeatHoldExpiredProducer` in `apps/seating/src/messaging/producers/` that wraps `KafkaProducer` and publishes one `SeatHoldExpired` envelope per `(showId, heldBy)` group to `TOPICS.SEATING`, keyed by `showId`
- The scheduler calls `SeatsService.releaseExpiredHolds()` then, for each group, calls the producer to emit `SeatHoldExpired`
- Add `@nestjs/schedule` as a dependency and wire `ScheduleModule.forRoot()` into `AppModule`
- **Known gap (documented, out of scope here):** `SeatHoldExpiredPayload` requires a `bookingId`, but the current HTTP hold only stores `heldBy` (userId) — there is no booking concept yet. Until the Booking saga is introduced, the scheduler populates `bookingId` with `heldBy` (the userId) as a placeholder. A future change will add a `booking_id` column to `seats` and refactor the hold flow to carry a real bookingId.

## Capabilities

### New Capabilities
- `seating-hold-expiration`: Periodic scheduler that releases expired seat holds and emits `SeatHoldExpired` events to Kafka

### Modified Capabilities
- `seat-hold`: Adds a new requirement for automatic release of expired holds (the hold is no longer permanent; it has a lifecycle that ends in release + event emission)

## Impact

- **Dependency:** Add `@nestjs/schedule` to root `package.json`
- **apps/seating/src/app.module.ts** — import `ScheduleModule.forRoot()`
- **apps/seating/src/seats/services/seats.service.ts** — add `releaseExpiredHolds()` method
- **apps/seating/src/seats/services/seat-expiration.scheduler.ts** — new file, `@Cron`-driven provider
- **apps/seating/src/messaging/producers/seat-hold-expired.producer.ts** — new producer wrapping `KafkaProducer`
- **apps/seating/src/messaging/messaging.module.ts** — wire producer
- **apps/seating/src/seats/seats.module.ts** — wire scheduler provider
- **Kafka topic:** `seating` (produces `SeatHoldExpired` events, keyed by `showId`)
- **Event type:** `SeatHoldExpired` (already defined in `@app/contracts` — no contract change needed)
- **EDA pattern practiced:** Scheduled Compensation (timeout-based release of held inventory)

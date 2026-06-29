## 1. Dependency & producer

- [x] 1.1 Install `@nestjs/schedule` (`pnpm add @nestjs/schedule`) and add `ScheduleModule.forRoot()` to `apps/seating/src/app.module.ts` imports
- [x] 1.2 Create `apps/seating/src/messaging/producers/seat-hold-expired.producer.ts` — injects `KafkaProducer`, exposes `emit(showId: string, holderId: string, seatIds: string[]): Promise<void>` that builds a `SeatHoldExpired` envelope (`eventId` = randomUUID, `eventType` = `EVENT_TYPES.SeatHoldExpired`, `correlationId` = randomUUID, `version: 1`, `payload` = `{ showId, bookingId: holderId, seatIds }`) and calls `kafkaProducer.publish<SeatHoldExpiredPayload>(TOPICS.SEATING, showId, envelope)`
- [x] 1.3 Export `SeatHoldExpiredProducer` from `MessagingModule` providers

## 2. Service & scheduler

- [x] 2.1 Add `releaseExpiredHolds()` to `SeatsService` — executes `UPDATE seats SET status='AVAILABLE', held_by=NULL, held_until=NULL, version=version+1 WHERE status='HELD' AND held_until < NOW() RETURNING seat_id, show_id, held_by` via `dataSource.createQueryBuilder()`, then groups returned rows by `(showId, heldBy)` and returns an array of `{ showId, holderId, seatIds: string[] }` groups
- [x] 2.2 Create `apps/seating/src/seats/services/seat-expiration.scheduler.ts` — `@Injectable()` provider with `@Cron('*/30 * * * * *')` method that calls `seatsService.releaseExpiredHolds()`, then for each group calls `producer.emit(group.showId, group.holderId, group.seatIds)` with try/catch per group (log and continue on failure)

## 3. Module wiring

- [x] 3.1 Update `SeatsModule` to import `MessagingModule`, add `SeatExpirationScheduler` to providers

## 4. Verify

- [x] 4.1 Run `pnpm tsc --noEmit` from monorepo root and confirm zero type errors
- [x] 4.2 Hold seats via `POST /shows/:showId/seats/hold`, wait > 5 minutes (or temporarily shorten the interval), confirm seats return to `status=AVAILABLE` in the seating DB and a `SeatHoldExpired` event appears in Redpanda Console at `localhost:8080` on the `seating` topic

## 1. Database Migration

- [x] 1.1 Create a TypeORM migration `AddProcessedEvents` in `apps/seating/src/database/migrations/` that adds the `processed_events` table (`event_id VARCHAR(36) PRIMARY KEY`, `processed_at TIMESTAMPTZ NOT NULL DEFAULT now()`).
- [x] 1.2 Register the migration in `apps/seating/src/database/data-source.ts` and verify `pnpm migration:run:seating` applies it cleanly.

## 2. Consumer Service

- [x] 2.1 Create `apps/seating/src/seats/show-published.consumer.ts` — a NestJS `@Injectable()` that implements `OnModuleInit`, injects `KafkaConsumer` and `DataSource`, and calls `KafkaConsumer.subscribe` in `onModuleInit` with group `seating-show-events` on topic `SHOW_EVENTS_TOPIC`.
- [x] 2.2 Implement the `handler`: open a `DataSource` transaction, bulk-insert all seats from the payload with `status = AVAILABLE` using `entityManager.createQueryBuilder().insert().into(Seat).values([...]).execute()`, then insert into `processed_events` (via `markProcessed`).
- [x] 2.3 Implement `isProcessed` and `markProcessed` using raw queries against `processed_events` (`SELECT 1` and `INSERT … ON CONFLICT DO NOTHING`).

## 3. Wiring

- [x] 3.1 Add `ShowPublishedConsumer` to the `providers` array of `SeatsModule` (`apps/seating/src/seats/seats.module.ts`).

## 4. Verification

- [x] 4.1 Publish a `ShowPublished` message to `show-events` via Redpanda Console (localhost:8080) and confirm rows appear in the `seats` table with `status = AVAILABLE` by querying the Seating database.

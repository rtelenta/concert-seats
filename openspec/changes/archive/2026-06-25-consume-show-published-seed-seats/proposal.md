## Why

When a show is published, the seating service needs to know about it so it can create seat records that are ready for reservation. Without consuming `ShowPublished`, the seating service has no seats to offer — blocking the reservation flow end to end.

## What Changes

- Add a Kafka consumer in `apps/seating` that subscribes to `show-events` and handles `ShowPublished` events.
- On `ShowPublished`, bulk-insert all seats from the event payload into the `seats` table with status `AVAILABLE`.
- Add idempotency tracking (processed-events table) to deduplicate at-least-once deliveries.
- Wire the `KafkaModule` and `KafkaConsumer` into `SeatingModule`.

## Capabilities

### New Capabilities

- `seating-show-published-consumer`: Consumes `ShowPublished` from the `show-events` topic and seeds the `seats` table with one `AVAILABLE` row per seat in the payload.

### Modified Capabilities

<!-- No existing spec-level requirements are changing. -->

## Impact

- **apps/seating**: new consumer module; new migration for processed-events table; updated `AppModule`.
- **libs/contracts**: no changes — `ShowPublished` contract already exists.
- **Topic**: `show-events` (consumed, not produced).
- **Pattern**: Idempotent Consumer (deduplication by `eventId` stored in a processed-events table).

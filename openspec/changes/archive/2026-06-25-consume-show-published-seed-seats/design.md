## Context

`apps/seating` already owns the `seats` table (via `InitSeating` migration) and has `KafkaModule` registered in `SeatingModule`. The `ShowPublished` contract and `SHOW_EVENTS_TOPIC` are defined in `libs/contracts`. The `KafkaConsumer` service from `libs/kafka` handles subscription, Zod validation, W3C trace propagation, and at-least-once deduplication via callbacks — the consumer service does not own the deduplication storage.

The missing piece is: a NestJS handler wired into `SeatingModule` that calls `KafkaConsumer.subscribe`, provides deduplication callbacks backed by a `processed_events` table, and bulk-inserts seats on each valid `ShowPublished`.

## Goals / Non-Goals

**Goals:**
- Seed `seats` rows with `status = AVAILABLE` for every seat in a `ShowPublished` payload.
- Guarantee idempotency: replaying the same `eventId` produces no duplicate rows.
- Reuse `KafkaConsumer` exactly as specced — no forking of the library.

**Non-Goals:**
- Handling any other event types on `show-events`.
- Updating existing seats if a show is republished (out of scope; append-only for now).
- Producing any outbound event from seating as a result of this ingestion.

## Decisions

### D1 — Single `ShowPublishedConsumer` service in `SeatsModule`

A new `ShowPublishedConsumer` NestJS service in `apps/seating/src/seats/` calls `KafkaConsumer.subscribe` in `onModuleInit`. It injects `DataSource` for the bulk insert and the processed-events deduplication.

**Alternatives:**
- Separate `ConsumerModule`: unnecessary indirection; the consumer is tightly coupled to the `seats` table.
- Re-using `SeatsService`: mixes write-path concerns; cleaner to keep the Kafka entrypoint isolated.

### D2 — Processed-events table in seating's database

```
processed_events (
  event_id  VARCHAR(36) PRIMARY KEY,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
)
```

`isProcessed` → `SELECT 1 FROM processed_events WHERE event_id = $1`.  
`markProcessed` → `INSERT INTO processed_events (event_id) VALUES ($1) ON CONFLICT DO NOTHING`.

**Alternatives:**
- Redis TTL cache: adds infrastructure dependency; overkill for this volume.
- In-memory Set: lost on restart, breaks at-least-once guarantee.

### D3 — Bulk insert via TypeORM `createQueryBuilder().insert().into(Seat).values([...]).execute()`

Single round-trip for the entire seats array. Wrapped in a `DataSource` transaction together with `markProcessed` so both succeed or both roll back atomically.

### D4 — Consumer group `seating-show-events`

Unique group id ensures seating consumes independently of any future service that also listens on `show-events`.

## Flow

```
Kafka: show-events
       │
       ▼
ShowPublishedConsumer.onModuleInit
  └─ KafkaConsumer.subscribe({
       topics: ['show-events'],
       handler,
       isProcessed,   ← SELECT processed_events
       markProcessed, ← INSERT processed_events  ┐ transaction
       schemaResolver ← ShowPublishedPayloadSchema ├─ INSERT seats (bulk)
     })                                           ┘
```

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| Large payload (thousands of seats) causes slow insert | TypeORM batch insert is single SQL; acceptable for expected venue sizes (~10k seats max) |
| `ShowPublished` replayed after seats already exist | Deduplication by `eventId` skips re-insert; no duplicate rows |
| Seating DB down at consumer startup | `KafkaConsumer` will not commit offsets on handler throw; messages redeliver on restart |

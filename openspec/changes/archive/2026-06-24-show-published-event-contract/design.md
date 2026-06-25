## Approach

Add a `show-published.event.ts` file to `libs/contracts/src/events/` containing the payload interface and two string constants (event type and topic name). Export them from the library index. Then wire `ShowsService.transitionStatus` to emit the event via the existing `KafkaProducer` whenever the new status is `PUBLISHED`.

The `ContractsModule` and `ContractsService` are NestJS scaffolding; leave them untouched. The new event file is plain TypeScript — no NestJS decorators needed.

## Architecture

```
libs/contracts/src/
  events/
    show-published.event.ts   ← new: ShowPublishedPayload + constants
  index.ts                    ← add: export * from './events/show-published.event'

apps/catalog/src/shows/
  shows.module.ts             ← add: KafkaModule to imports
  shows.service.ts            ← inject KafkaProducer, emit after PUBLISHED save
```

### ShowPublishedPayload shape

```ts
export interface ShowPublishedPayload {
  showId: string;
  title: string;
  artist: string;
  dateTime: string;   // ISO 8601
  venueId: string;
}

export const SHOW_PUBLISHED = 'ShowPublished';
export const SHOW_EVENTS_TOPIC = 'show-events';
```

### Emit site in ShowsService.transitionStatus

```ts
// after showRepository.save(show):
if (newStatus === ShowStatus.PUBLISHED) {
  await this.kafkaProducer.publish<ShowPublishedPayload>(
    SHOW_EVENTS_TOPIC,
    show.id,       // partition key = showId
    {
      eventId: randomUUID(),
      eventType: SHOW_PUBLISHED,
      occurredAt: new Date().toISOString(),
      correlationId: randomUUID(),
      causationId: randomUUID(),
      version: 1,
      payload: {
        showId: show.id,
        title: show.title,
        artist: show.artist,
        dateTime: show.dateTime.toISOString(),
        venueId: show.venueId,
      },
    },
  );
}
```

## Key Decisions

- **Partition key = `show.id`**: All events for a given show land on the same partition, preserving order — consistent with the `seat-events` convention in the kafka-producer spec.
- **`dateTime` as ISO string**: The envelope is JSON-serialised; `Date` objects become strings. Declaring the payload field as `string` makes the contract honest for consumers.
- **`correlationId` / `causationId` generated here**: No request-scoped correlation context is threaded into the service layer yet. Both are fresh UUIDs for now; this can be refined when a correlation middleware is added.
- **`KafkaModule` added to `ShowsModule`**: `KafkaProducer` lives in `KafkaModule`; it needs to be imported before it can be injected.
- **No `ContractsModule` import needed**: The contracts library exports plain interfaces and constants, not NestJS providers.

## Trade-offs

| Option | Pro | Con | Decision |
|---|---|---|---|
| Emit in service layer | Simple, keeps controller thin | Service has two concerns (DB + Kafka) | Chosen — standard pattern here |
| Emit in controller after service call | Separation of concerns | Controller must handle partial failure | Avoided |
| Outbox pattern | Guarantees at-least-once | Significant complexity | Future work |

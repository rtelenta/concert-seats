## 1. Define the Contract

- [x] 1.1 Create `libs/contracts/src/events/show-published.event.ts` with `ShowPublishedPayload` interface, `SHOW_PUBLISHED` constant (`'ShowPublished'`), and `SHOW_EVENTS_TOPIC` constant (`'show-events'`)
- [x] 1.2 Add `export * from './events/show-published.event';` to `libs/contracts/src/index.ts`

## 2. Wire the Catalog Service

- [x] 2.1 Import `KafkaModule` in `apps/catalog/src/shows/shows.module.ts` so `KafkaProducer` is available for injection
- [x] 2.2 Inject `KafkaProducer` into `ShowsService` and emit a `ShowPublished` `EventEnvelope` inside `transitionStatus` after `showRepository.save(show)` when `newStatus === ShowStatus.PUBLISHED`

## 3. Verify

- [x] 3.1 Start infra (`pnpm infra:up`) and the catalog service (`pnpm start:dev catalog`), call `PATCH /shows/:id/publish` on a DRAFT show, and confirm the `ShowPublished` message appears on the `show-events` topic in Redpanda Console at `http://localhost:8080`

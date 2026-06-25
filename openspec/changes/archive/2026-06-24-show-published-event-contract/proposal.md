## Why

`libs/contracts` is the single source of truth for every Kafka event and command in the ConcertSeats platform, but it currently contains only the shared `EventEnvelope` interface and empty NestJS scaffold files. Any service that needs to produce or consume a show event today has no shared contract to import — they would have to define payload shapes inline, which breaks the single-source-of-truth rule and risks consumer/producer drift.

The first event to define is `ShowPublished`, emitted by the Catalog service when a show transitions from `DRAFT` to `PUBLISHED`. Future consumers (e.g. a Booking or Notification service) must be able to import the payload type, event type constant, and topic name from `@app/contracts` without knowing catalog internals.

## What Changes

- Add `ShowPublishedPayload` interface capturing the fields a consumer needs after a show is published
- Add `SHOW_PUBLISHED` event-type constant (`'ShowPublished'`)
- Add `SHOW_EVENTS_TOPIC` topic-name constant (`'show-events'`)
- Export all of the above from `libs/contracts/src/index.ts`
- Wire the Catalog service's publish flow to emit a `ShowPublished` `EventEnvelope` via `KafkaProducer` after successfully transitioning a show to `PUBLISHED`

## Capabilities

### New Capabilities

- `show-published-contract`: Define `ShowPublishedPayload`, `SHOW_PUBLISHED`, and `SHOW_EVENTS_TOPIC` in `libs/contracts`

### Modified Capabilities

- `catalog-show-publish`: After persisting the `DRAFT → PUBLISHED` transition, the Catalog service SHALL emit a `ShowPublished` event to the `show-events` topic with `showId` as the partition key

## Impact

- `libs/contracts/src/events/show-published.event.ts` — new file: payload interface + constants
- `libs/contracts/src/index.ts` — re-export the new event file
- `apps/catalog/src/shows/shows.service.ts` — emit `ShowPublished` after `transitionStatus` succeeds
- No database schema changes; no new topics need to be pre-created (Redpanda auto-creates on first publish)
- No changes to `EventEnvelope` — used as-is

## Why

The `ShowPublished` event currently only carries show-level metadata (title, artist, dateTime, venueId). Consumers that need to act on seat availability — such as a future Booking service that caches available seats on publish — have no way to know which seats exist without querying the Catalog service's database, which violates the no-cross-service-database-reads rule.

Including seat definitions in the `ShowPublished` payload lets consumers bootstrap their own view of seat inventory at publish time, without any follow-up calls.

## What Changes

- Add a `seats` array to `ShowPublishedPayload` in `@app/contracts`, where each element is a `ShowPublishedSeat` with `seatDefinitionId`, `section`, `row`, `number`, and `price`
- In `ShowsService.transitionStatus`, inject `SeatDefinitionsService` and load seats before building the envelope, then include them in the payload
- Bump `version` in the envelope from `1` to `2` to signal the breaking payload change to consumers

## Capabilities

### Modified Capabilities

- `show-published-contract`: `ShowPublishedPayload` gains a required `seats: ShowPublishedSeat[]` field; envelope `version` bumped to `2`
- `catalog-show-publish`: the `ShowPublished` event now includes seat definitions fetched at publish time

## Impact

- `libs/contracts/src/events/show-published.event.ts` — add `ShowPublishedSeat` interface and `seats` field to `ShowPublishedPayload`
- `apps/catalog/src/shows/shows.service.ts` — inject `SeatDefinitionsService`, fetch seats after saving, include in payload, bump version to `2`
- `SeatDefinitionsService` is already available in `ShowsModule` via the existing `SeatDefinitionsModule` import — no module wiring changes needed
- No migration needed; no DB schema change; no new Kafka topics

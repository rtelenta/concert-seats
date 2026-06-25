## Approach

Add a `ShowPublishedSeat` interface and a `seats` field to `ShowPublishedPayload` in `@app/contracts`. In `ShowsService.transitionStatus`, inject `SeatDefinitionsService` and call `findByShowId` after persisting the transition, then map the results into the envelope payload. Bump the envelope `version` to `2`.

`SeatDefinitionsService` is already exported by `SeatDefinitionsModule`, which is already imported by `ShowsModule`, so no module wiring changes are needed.

## Architecture

```
libs/contracts/src/events/show-published.event.ts
  + ShowPublishedSeat interface
  ShowPublishedPayload.seats: ShowPublishedSeat[]

apps/catalog/src/shows/shows.service.ts
  + inject SeatDefinitionsService
  transitionStatus():
    1. save show
    2. if PUBLISHED: fetch seats via seatDefinitionsService.findByShowId(saved.id)
    3. build payload with seats mapped to ShowPublishedSeat
    4. publish envelope (version: 2)
```

### Updated contract shape

```ts
export interface ShowPublishedSeat {
  seatDefinitionId: string;
  section: string;
  row: string;
  number: number;
  price: number;
}

export interface ShowPublishedPayload {
  showId: string;
  title: string;
  artist: string;
  dateTime: string;    // ISO 8601
  venueId: string;
  seats: ShowPublishedSeat[];
}
```

## Key Decisions

- **Version bumped to `2`**: Adding `seats` is a breaking change for consumers expecting `version: 1` — they must handle the new shape. Using `version: 2` lets consumers gate on the version field.
- **Seats fetched after save**: The save must commit before fetching seats, to avoid any race with concurrent seat writes. Both are in the same service call, which is acceptable since seat definitions are not updated at publish time.
- **`price` as `number`**: Consistent with `SeatDefinitionResponseDto.price`, which already converts the `numeric(10,2)` DB value to a JS number.
- **No `SeatDefinitionsModule` re-import**: Already available via the existing `ShowsModule` → `SeatDefinitionsModule` import chain.

## Trade-offs

| Option | Pro | Con | Decision |
|---|---|---|---|
| Include seats in payload | Consumers self-sufficient at publish | Larger message | Chosen — avoids cross-service DB reads |
| Emit separate `SeatsListed` event | Smaller messages, composable | Consumers must correlate two events | Avoided for now |
| version: 1 with optional seats | Backward compat | Consumers can't distinguish old/new | Avoided — clean break is safer |

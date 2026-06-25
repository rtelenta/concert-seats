## 1. Update the Contract

- [x] 1.1 Add `ShowPublishedSeat` interface and `seats: ShowPublishedSeat[]` field to `ShowPublishedPayload` in `libs/contracts/src/events/show-published.event.ts`

## 2. Update the Emit Site

- [x] 2.1 In `apps/catalog/src/shows/shows.service.ts`, inject `SeatDefinitionsService`, fetch seats via `findByShowId(saved.id)` after the save, map them to `ShowPublishedSeat`, include in `payload.seats`, and bump the envelope `version` from `1` to `2`

## 3. Verify

- [x] 3.1 Run `pnpm exec nest build catalog` and confirm it compiles without errors

## 1. Dependencies & Env

- [x] 1.1 Add `@nestjs/axios` and `axios` to root `package.json` and run `pnpm install`
- [x] 1.2 Add `CATALOG_URL=http://localhost:5001` and `SEATING_URL=http://localhost:5002` to `.env.example` and `.env`

## 2. Scaffold Module

- [x] 2.1 Run `nest g module shows --project concertseats` then move the generated `shows.module.ts` to `apps/concertseats/src/shows/shows.module.ts`

## 3. DTOs

- [x] 3.1 Create `apps/concertseats/src/shows/dtos/show-response.dto.ts` — mirrors the catalog `ShowResponseDto` shape (id, title, artist, dateTime, status, venueId, createdAt, updatedAt)
- [x] 3.2 Create `apps/concertseats/src/shows/dtos/seat-definition-response.dto.ts` — mirrors the catalog `SeatDefinitionResponseDto` shape
- [x] 3.3 Create `apps/concertseats/src/shows/dtos/seat-response.dto.ts` — mirrors the seating `Seat` entity shape

## 4. Query Service

- [x] 4.1 Create `apps/concertseats/src/shows/services/shows-query.service.ts` — inject `HttpService` and `ConfigService`; implement `getShows()`, `getShow(id)`, `getSeatDefinitions(id)`, `getSeats(id)` using `lastValueFrom`; use `ConfigService.getOrThrow` for `CATALOG_URL` / `SEATING_URL`

## 5. Controller

- [x] 5.1 Create `apps/concertseats/src/shows/controllers/shows.controller.ts` — map `GET /shows`, `GET /shows/:id`, `GET /shows/:id/seat-definitions`, `GET /shows/:id/seats` to the corresponding query-service methods

## 6. Module Wiring

- [x] 6.1 Update `apps/concertseats/src/shows/shows.module.ts` — import `HttpModule`, provide `ShowsQueryService`, declare `ShowsController`
- [x] 6.2 Import `ShowsModule` into `apps/concertseats/src/app.module.ts`

## 7. Verification

- [x] 7.1 Run `npx tsc --project apps/concertseats/tsconfig.app.json --noEmit` and confirm no type errors
- [x] 7.2 Start catalog, seating, and concertseats; `curl http://localhost:5000/shows` and confirm the show list is returned
- [x] 7.3 `curl http://localhost:5000/shows/:id/seats` and confirm seats are returned from the seating service

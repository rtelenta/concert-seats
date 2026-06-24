## 1. SeatDefinitionsService

- [x] 1.1 Create `apps/catalog/src/seat-definitions/seat-definitions.service.ts` with a `findByShowId(showId: string)` method that returns all seat definitions for a show
- [x] 1.2 Export `SeatDefinitionsService` from `SeatDefinitionsModule` and add `TypeOrmModule.forFeature([SeatDefinition])` to its imports

## 2. ShowsService Read Methods

- [x] 2.1 Add `findAllPublished()` to `ShowsService`: query shows where `status = PUBLISHED` ordered by `dateTime` ASC
- [x] 2.2 Add `findOne(id: string)` to `ShowsService`: find by ID, throw `NotFoundException` if missing

## 3. Response DTOs

- [x] 3.1 Create `apps/catalog/src/shows/dto/show-response.dto.ts` mapping entity fields to a plain response shape
- [x] 3.2 Create `apps/catalog/src/seat-definitions/dto/seat-definition-response.dto.ts` mapping entity fields, casting `price` to `number`

## 4. ShowsController

- [x] 4.1 Create `apps/catalog/src/shows/shows.controller.ts` with `GET /shows`, `GET /shows/:id`, and `GET /shows/:id/seats` handlers; import `SeatDefinitionsService` and `SeatDefinitionsModule` into `ShowsModule`

## 5. Verification

- [x] 5.1 Start the catalog service and confirm `GET /shows` returns seeded published shows, `GET /shows/:id` returns a single show, and `GET /shows/:id/seats` returns 90 seat definitions for a seeded show; confirm a non-existent ID returns 404

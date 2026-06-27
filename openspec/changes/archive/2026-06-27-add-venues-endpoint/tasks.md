## 1. Catalog — Venue HTTP Layer

- [x] 1.1 Add `VenuesService` to `apps/catalog/src/venues/venues.service.ts` with `findAll()` and `findOne(id)` methods backed by `InjectRepository(Venue)`
- [x] 1.2 Add `VenueResponseDto` to `apps/catalog/src/venues/dtos/venue-response.dto.ts` with fields `id`, `name`, `city`, `capacity` and a static `from(venue)` factory
- [x] 1.3 Add `VenuesController` to `apps/catalog/src/venues/controllers/venues.controller.ts` with `GET /venues` and `GET /venues/:id` routes, returning `VenueResponseDto`
- [x] 1.4 Update `VenuesModule` to declare `VenuesController` and `VenuesService` (keep existing `TypeOrmModule.forFeature([Venue])` import)

## 2. Gateway — Venue Proxy Layer

- [x] 2.1 Add `VenuesQueryService` to `apps/concertseats/src/venues/services/venues-query.service.ts` with `getVenues()` and `getVenue(id)` methods that proxy to `${CATALOG_URL}/venues` and `${CATALOG_URL}/venues/:id`
- [x] 2.2 Add `VenueResponseDto` to `apps/concertseats/src/venues/dtos/venue-response.dto.ts` (mirrors catalog shape: `id`, `name`, `city`, `capacity`)
- [x] 2.3 Add `VenuesController` to `apps/concertseats/src/venues/controllers/venues.controller.ts` with `GET /venues` and `GET /venues/:id`, delegating to `VenuesQueryService`
- [x] 2.4 Create `apps/concertseats/src/venues/venues.module.ts` importing `HttpModule`, declaring `VenuesController` and `VenuesQueryService`
- [x] 2.5 Register `VenuesModule` in `apps/concertseats/src/app.module.ts`

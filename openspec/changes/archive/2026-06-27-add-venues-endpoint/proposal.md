## Why

The `Venue` entity and data layer already exist in `app/catalog`, but there are no HTTP endpoints to read venue data. Clients (including the gateway) have no way to fetch venue listings or details without going directly to the database.

## What Changes

- Add `GET /venues` and `GET /venues/:id` HTTP endpoints to `app/catalog`
- Add `VenuesService` with read methods to `app/catalog`
- Add a `VenuesModule` in `app/concertseats` that proxies the two catalog venue routes
- Register the new gateway `VenuesModule` in the root `AppModule`

## Capabilities

### New Capabilities

- `catalog-venue-api`: HTTP read endpoints (`GET /venues`, `GET /venues/:id`) exposed by the catalog service
- `gateway-venue-routes`: Gateway proxy routes for venues, forwarding to catalog

### Modified Capabilities

- `venue-management`: Add HTTP endpoint requirements for listing and retrieving venues (the existing spec covers create/retrieve at the data layer but not the API surface)

## Impact

- `apps/catalog/src/venues/` — new controller and service added; `VenuesModule` updated
- `apps/concertseats/src/venues/` — new module directory with controller and query service
- `apps/concertseats/src/app.module.ts` — imports new `VenuesModule`
- No new environment variables; gateway reuses the existing `CATALOG_URL`

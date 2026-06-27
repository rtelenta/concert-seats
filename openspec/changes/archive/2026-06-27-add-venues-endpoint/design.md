## Context

The catalog service already has a `Venue` entity and `VenuesModule` (which only exports `TypeOrmModule`). No HTTP controller or service exists. The gateway follows a consistent pattern: each domain has a module containing a controller (HTTP routing) and a query service (HTTP proxy to downstream). The shows domain already implements this pattern and serves as the reference.

## Goals / Non-Goals

**Goals:**
- Expose `GET /venues` and `GET /venues/:id` in catalog
- Mirror those two routes in the gateway via HTTP proxy
- Reuse the existing `Venue` entity and `VenuesModule` without restructuring the catalog data layer

**Non-Goals:**
- Create, update, or delete venue operations (write endpoints are out of scope for this change)
- Authentication/authorization on venue routes (read-only public data, consistent with `/shows`)
- Pagination on the venue list

## Decisions

**Catalog follows the shows module pattern**
`VenuesService` is added with `findAll` and `findOne` methods backed by TypeORM repository injection. `VenuesController` maps `GET /venues` and `GET /venues/:id` to those methods. `VenuesModule` is updated to declare both and keep the `TypeOrmModule` import.
*Alternative*: reuse the existing `ShowsService` as a model — rejected, venues are a separate domain.

**VenueResponseDto mirrors ShowResponseDto shape**
A `VenueResponseDto` with a static `from(venue)` factory is added to keep controller return types explicit and consistent with the shows pattern. Fields: `id`, `name`, `city`, `capacity`.

**Gateway venues module is self-contained**
`VenuesQueryService` in the gateway holds the `catalogUrl` from `ConfigService` and makes `GET` calls to `/venues` and `/venues/:id`. This is the same pattern as `ShowsQueryService` and keeps concerns isolated.
*Alternative*: extend `ShowsQueryService` to include venue methods — rejected, it conflates two domain concerns.

**No new environment variables**
The gateway already reads `CATALOG_URL`; venue routes reuse it. No additional config needed.

## Risks / Trade-offs

- **Large venue list with no pagination** → The spec does not require pagination; if the venue count grows large this may need revisiting. Mitigation: acceptable for current scale; pagination can be added as a follow-up.
- **Tight gateway–catalog coupling** → The gateway mirrors the catalog's URL structure. Any rename of the `/venues` prefix in catalog must be reflected in the gateway. Mitigation: low risk since route naming is stable.

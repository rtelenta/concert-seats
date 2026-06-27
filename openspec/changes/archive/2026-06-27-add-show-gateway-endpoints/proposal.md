## Why

The `concertseats` service is the public-facing HTTP gateway but currently exposes no show or seat data. Clients (the Next.js frontend) need a single origin for all concert information — without these routes, the frontend would reach catalog and seating directly, bypassing the gateway.

## What Changes

- Add a `shows` module to `apps/concertseats` that proxies four read routes:
  - `GET /shows` → catalog
  - `GET /shows/:id` → catalog
  - `GET /shows/:id/seat-definitions` → catalog
  - `GET /shows/:id/seats` → seating
- Register `@nestjs/axios` `HttpModule` in the shows module for outbound HTTP calls
- Add `CATALOG_URL` and `SEATING_URL` environment variables

**Pattern**: HTTP Gateway (Backends-for-Frontends). No Kafka topics, no events.

**Layers touched**:
- `concertseats`: `controller` + `query-service` (new `shows` module)
- `catalog`: no changes (consumed as a downstream HTTP service)
- `seating`: no changes (consumed as a downstream HTTP service)

## Capabilities

### New Capabilities
- `gateway-show-routes`: The concertseats gateway proxies show and seat-related read endpoints to the catalog and seating services, returning their responses transparently

### Modified Capabilities
<!-- No existing spec-level requirements are changing -->

## Impact

- **New module**: `apps/concertseats/src/shows/` — controller, query-service, DTOs, exceptions
- **New dependency**: `@nestjs/axios` + `axios`
- **New env vars**: `CATALOG_URL`, `SEATING_URL`
- **Downstream services**: unchanged

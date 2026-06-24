## Why

The catalog service stores shows and seat definitions but exposes no HTTP endpoints, making the data unreachable by any client or downstream service. Adding read-only endpoints unblocks front-end development and other services that need to browse shows and check available seat layouts.

## What Changes

- `GET /shows` — returns all shows with status `PUBLISHED`, ordered by `date_time` ascending
- `GET /shows/:id` — returns a single show by ID; responds 404 if not found
- `GET /shows/:id/seats` — returns all seat definitions for a show; responds 404 if the show does not exist

No write operations, no authentication, no pagination in this change.

## Capabilities

### New Capabilities

- `catalog-show-listing`: List published shows via HTTP
- `catalog-show-detail`: Fetch a single show by ID via HTTP
- `catalog-show-seats`: List seat definitions for a show via HTTP

### Modified Capabilities

<!-- No existing spec-level requirements are changing -->

## Impact

- **Files added**: `ShowsController`, response DTOs for show and seat definition, updates to `ShowsService` (add list + findOne methods), `SeatDefinitionsService` (add findByShow method)
- **No Kafka events**: read-only endpoints produce no side effects
- **No schema changes**: no new migrations needed
- **No auth**: endpoints are public for now; auth can be layered in a later change

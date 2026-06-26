## Why

Clients (gateway / frontend) need to display seat availability for a show so users can choose seats before reserving. The `seats` table is already populated by `ShowPublished`, but there is no HTTP endpoint to query it.

## What Changes

- Add `GET /shows/:id/seats` in `apps/seating` that returns all seats for a show with their current `status`, `section`, `row`, `number`, and `price`.

## Capabilities

### New Capabilities

- `seating-list-seats`: REST endpoint in the seating service that retrieves all seats for a given `showId`, exposing each seat's id, section, row, number, price, and current status.

### Modified Capabilities

<!-- No existing spec-level requirements are changing. -->

## Impact

- **apps/seating**: new `SeatsService` with a `findByShow` method; new `SeatsController` exposing `GET /shows/:id/seats`; updated `SeatsModule`.
- **Pattern**: Read-only query against the seating service's own database — no cross-service calls, no Kafka messages.

## Why

The catalog service already enforces a `DRAFT → PUBLISHED` state machine internally, but there is no HTTP endpoint for a caller to trigger that transition. Operators need a way to publish shows so they become visible to the public listing.

## What Changes

- Add `PATCH /shows/:id/publish` endpoint to the catalog service that transitions a show from `DRAFT` to `PUBLISHED`
- The existing `transitionStatus` service method already enforces the state machine; this change wires it to an HTTP route
- Returns the updated show resource on success; returns 422 if the show is not in `DRAFT` status, 404 if not found

## Capabilities

### New Capabilities
- `catalog-show-publish`: PATCH endpoint that transitions a show's status from `DRAFT` to `PUBLISHED`, delegating enforcement to the existing state machine

### Modified Capabilities
<!-- No existing specs require requirement-level changes — the state machine rules are already captured in show-management -->

## Impact

- **Code**: `ShowsController` gains one new route; no service changes needed
- **API**: New `PATCH /shows/:id/publish` route on the catalog service
- **EDA pattern**: This is a pure HTTP write operation. No Kafka events are emitted in this change — a future change can introduce a `ShowPublished` domain event if downstream services need to react
- **Services affected**: `apps/catalog` only

## Context

The catalog service has a `transitionStatus(showId, newStatus)` method on `ShowsService` that enforces the `DRAFT → PUBLISHED` (and `DRAFT → CANCELLED`) state machine. The `ShowsController` currently exposes only read endpoints. This change wires the existing publish transition to an HTTP route — no service logic or data model changes are required.

## Goals / Non-Goals

**Goals:**
- Expose `PATCH /shows/:id/publish` that calls `transitionStatus(id, PUBLISHED)`
- Return the updated show as a `ShowResponseDto` on success
- Surface 404 and 422 errors already thrown by the service layer

**Non-Goals:**
- Emitting a Kafka `ShowPublished` event (deferred to a future change)
- Supporting `PATCH /shows/:id/cancel` (separate concern)
- Authentication / authorization checks (handled at the gateway)

## Decisions

### Route shape: `PATCH /shows/:id/publish` vs `PATCH /shows/:id/status`

Chose `PATCH /shows/:id/publish` (action-based sub-resource) over a generic status-patch body.

Rationale: The transition is intentional and irreversible from the caller's perspective; an action URL makes the intent unambiguous and avoids needing to validate/parse a body. A generic `{ status: "PUBLISHED" }` body would require body parsing for a single allowed value and leak state-machine awareness into the HTTP contract unnecessarily.

## Risks / Trade-offs

- [Risk] No auth guard on this endpoint → Mitigation: out of scope here; the gateway enforces auth before requests reach the catalog service
- [Trade-off] Action URL is less RESTfully "pure" than a PATCH body, but aligns with the pattern already used in similar admin operations and avoids a body DTO with a single constrained enum value

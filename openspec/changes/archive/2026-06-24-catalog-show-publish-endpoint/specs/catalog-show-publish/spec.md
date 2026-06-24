## ADDED Requirements

### Requirement: Publish a show via HTTP
The catalog service SHALL expose `PATCH /shows/:id/publish` to transition a show from `DRAFT` to `PUBLISHED` and return the updated show resource.

#### Scenario: Successfully publish a draft show
- **WHEN** a caller sends `PATCH /shows/:id/publish` for a show with `status = DRAFT`
- **THEN** the service responds with HTTP 200 and the full show resource with `status = PUBLISHED` and a refreshed `updatedAt`

#### Scenario: Show not found
- **WHEN** a caller sends `PATCH /shows/:id/publish` with an unknown `id`
- **THEN** the service responds with HTTP 404

#### Scenario: Show is not in DRAFT status
- **WHEN** a caller sends `PATCH /shows/:id/publish` for a show whose `status` is `PUBLISHED` or `CANCELLED`
- **THEN** the service responds with HTTP 422 and an error message indicating the transition is not allowed

# Spec: catalog-show-publish

## Purpose

Defines the HTTP endpoint for publishing a show in the catalog service, transitioning it from `DRAFT` to `PUBLISHED` status.

## Requirements

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

### Requirement: Catalog emits ShowPublished event after successful publish
After a successful `DRAFT` → `PUBLISHED` transition, the catalog service SHALL emit a `ShowPublished` event to the `show-events` topic using `showId` as the Kafka partition key. No event SHALL be emitted when the response is 404 or 422.

#### Scenario: Event emitted on successful publish
- **WHEN** `PATCH /shows/:id/publish` succeeds and the show transitions to `PUBLISHED`
- **THEN** a `ShowPublished` message is produced to the `show-events` topic with the `showId` as the partition key

#### Scenario: No event on 404
- **WHEN** `PATCH /shows/:id/publish` responds with HTTP 404
- **THEN** no message is produced to the `show-events` topic

#### Scenario: No event on 422
- **WHEN** `PATCH /shows/:id/publish` responds with HTTP 422
- **THEN** no message is produced to the `show-events` topic

### Requirement: Publish endpoint is documented in the OpenAPI spec
The `PATCH /shows/:id/publish` endpoint SHALL be annotated so that the generated OpenAPI document includes its tag, summary, path parameter, and response schemas for the 200, 404, and 422 cases.

#### Scenario: Endpoint appears in Swagger UI
- **WHEN** `GET /api/docs-json` is requested from the catalog service
- **THEN** the document contains a `PATCH /shows/{id}/publish` path entry under the `shows` tag with `200`, `404`, and `422` response entries

#### Scenario: 422 response is documented
- **WHEN** the OpenAPI document is inspected for `PATCH /shows/{id}/publish`
- **THEN** a `422` response is present with a description indicating the show is not in DRAFT status

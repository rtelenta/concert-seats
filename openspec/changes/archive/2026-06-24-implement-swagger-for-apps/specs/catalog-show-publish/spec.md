## ADDED Requirements

### Requirement: Publish endpoint is documented in the OpenAPI spec
The `PATCH /shows/:id/publish` endpoint SHALL be annotated so that the generated OpenAPI document includes its tag, summary, path parameter, and response schemas for the 200, 404, and 422 cases.

#### Scenario: Endpoint appears in Swagger UI
- **WHEN** `GET /api/docs-json` is requested from the catalog service
- **THEN** the document contains a `PATCH /shows/{id}/publish` path entry under the `shows` tag with `200`, `404`, and `422` response entries

#### Scenario: 422 response is documented
- **WHEN** the OpenAPI document is inspected for `PATCH /shows/{id}/publish`
- **THEN** a `422` response is present with a description indicating the show is not in DRAFT status

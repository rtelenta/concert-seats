## ADDED Requirements

### Requirement: Show detail endpoint is documented in the OpenAPI spec
The `GET /shows/:id` endpoint SHALL be annotated so that the generated OpenAPI document includes its tag, summary, path parameter, and response schemas for both the 200 and 404 cases.

#### Scenario: Endpoint appears in Swagger UI
- **WHEN** `GET /api/docs-json` is requested from the catalog service
- **THEN** the document contains a `GET /shows/{id}` path entry under the `shows` tag with a `200` response schema and a `404` response entry

#### Scenario: Path parameter is documented
- **WHEN** the OpenAPI document is inspected for `GET /shows/{id}`
- **THEN** the `id` path parameter is listed as required with type `string`

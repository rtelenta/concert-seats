## ADDED Requirements

### Requirement: Seat definitions endpoint is documented in the OpenAPI spec
The `GET /shows/:id/seats` endpoint SHALL be annotated so that the generated OpenAPI document includes its tag, summary, path parameter, and response schema. The response schema MUST accurately reflect the fields `id`, `showId`, `section`, `row`, `number`, `price`, `createdAt`, with `price` typed as `number`.

#### Scenario: Endpoint appears in Swagger UI
- **WHEN** `GET /api/docs-json` is requested from the catalog service
- **THEN** the document contains a `GET /shows/{id}/seats` path entry under the `shows` tag with a `200` response schema describing an array of seat definition objects

#### Scenario: price field is typed as number in schema
- **WHEN** the OpenAPI document is inspected for `GET /shows/{id}/seats`
- **THEN** the `price` property in the response schema has `"type": "number"` (not `"string"`)

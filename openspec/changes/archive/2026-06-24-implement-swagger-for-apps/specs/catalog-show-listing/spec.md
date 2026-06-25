## ADDED Requirements

### Requirement: Show listing endpoint is documented in the OpenAPI spec
The `GET /shows` endpoint SHALL be annotated so that the generated OpenAPI document includes its tag, summary, and response schema. The response schema MUST accurately reflect the fields `id`, `title`, `artist`, `dateTime`, `status`, `venueId`, `createdAt`, `updatedAt`.

#### Scenario: Endpoint appears in Swagger UI
- **WHEN** `GET /api/docs-json` is requested from the catalog service
- **THEN** the document contains a `GET /shows` path entry under the `shows` tag with a `200` response schema describing an array of show objects

#### Scenario: Response schema matches actual response fields
- **WHEN** the OpenAPI document is validated against the actual `GET /shows` response
- **THEN** every field in the response body has a corresponding property defined in the schema with the correct type

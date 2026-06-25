## Purpose

TBD

## Requirements

### Requirement: List published shows
`GET /shows` SHALL return an array of all shows with `status = PUBLISHED`, ordered by `date_time` ascending. The response body MUST be a JSON array where each element includes at minimum: `id`, `title`, `artist`, `dateTime`, `status`, `venueId`, `createdAt`, `updatedAt`.

#### Scenario: Shows exist
- **GIVEN** at least one show with `status = PUBLISHED` is in the database
- **WHEN** `GET /shows` is requested
- **THEN** the response is `200 OK` with a JSON array containing those shows ordered by `date_time` ascending

#### Scenario: No published shows
- **GIVEN** no shows with `status = PUBLISHED` exist
- **WHEN** `GET /shows` is requested
- **THEN** the response is `200 OK` with an empty JSON array `[]`

#### Scenario: Draft and cancelled shows are excluded
- **GIVEN** shows with `status = DRAFT` and `status = CANCELLED` exist, along with some `PUBLISHED` shows
- **WHEN** `GET /shows` is requested
- **THEN** only `PUBLISHED` shows are returned; `DRAFT` and `CANCELLED` shows are not present in the response

### Requirement: Show listing endpoint is documented in the OpenAPI spec
The `GET /shows` endpoint SHALL be annotated so that the generated OpenAPI document includes its tag, summary, and response schema. The response schema MUST accurately reflect the fields `id`, `title`, `artist`, `dateTime`, `status`, `venueId`, `createdAt`, `updatedAt`.

#### Scenario: Endpoint appears in Swagger UI
- **WHEN** `GET /api/docs-json` is requested from the catalog service
- **THEN** the document contains a `GET /shows` path entry under the `shows` tag with a `200` response schema describing an array of show objects

#### Scenario: Response schema matches actual response fields
- **WHEN** the OpenAPI document is validated against the actual `GET /shows` response
- **THEN** every field in the response body has a corresponding property defined in the schema with the correct type

## ADDED Requirements

### Requirement: Swagger UI is served in non-production environments
Each NestJS app (catalog, concertseats) SHALL bootstrap `SwaggerModule` in `main.ts` and serve the Swagger UI at `/api/docs` when `NODE_ENV` is not `production`. The raw OpenAPI JSON spec SHALL be accessible at `/api/docs-json`.

#### Scenario: Swagger UI is available in development
- **WHEN** the app is started with `NODE_ENV=development` (or unset)
- **THEN** `GET /api/docs` returns HTTP 200 with an HTML page containing the Swagger UI

#### Scenario: OpenAPI JSON spec is available
- **WHEN** the app is started with `NODE_ENV=development`
- **THEN** `GET /api/docs-json` returns HTTP 200 with a valid OpenAPI 3.x JSON document

#### Scenario: Swagger UI is not served in production
- **WHEN** the app is started with `NODE_ENV=production`
- **THEN** `GET /api/docs` returns HTTP 404

### Requirement: OpenAPI document includes service metadata
The generated OpenAPI document SHALL include a `title` matching the service name (e.g. "Catalog Service") and a `version` of `"1.0"`.

#### Scenario: Document metadata is correct
- **WHEN** `GET /api/docs-json` is requested
- **THEN** the response JSON contains `info.title` with the service name and `info.version = "1.0"`

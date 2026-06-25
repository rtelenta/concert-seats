## MODIFIED Requirements

### Requirement: OpenAPI document includes service metadata
The generated OpenAPI document SHALL include a `title` matching the service name (e.g. "Catalog Service") and a `version` of `"1.0"`. DTO property schemas SHALL be generated automatically via the `@nestjs/swagger` CLI plugin configured in `nest-cli.json`, ensuring all TypeScript-typed properties are reflected in the document without requiring manual `@ApiProperty()` decorators on each field.

#### Scenario: Document metadata is correct
- **WHEN** `GET /api/docs-json` is requested
- **THEN** the response JSON contains `info.title` with the service name and `info.version = "1.0"`

#### Scenario: DTO property schemas are accurate without manual decorators
- **WHEN** `GET /api/docs-json` is requested from the catalog service
- **THEN** the schema for `ShowResponseDto` includes all fields (`id`, `title`, `artist`, `dateTime`, `status`, `venueId`, `createdAt`, `updatedAt`) with correct types, without those fields carrying `@ApiProperty()` decorators in source

#### Scenario: Removing a DTO field is automatically reflected in docs
- **WHEN** a field is removed from a response DTO class
- **THEN** the corresponding property disappears from the OpenAPI schema on the next build, without requiring any decorator change

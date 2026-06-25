## Why

The catalog and concertseats NestJS apps expose HTTP APIs with no machine-readable documentation, making it hard for consumers (frontend, other teams) to discover endpoints, understand request/response shapes, and test interactively. Adding Swagger/OpenAPI docs gives developers a live, always-accurate API reference with zero manual upkeep.

## What Changes

- Install `@nestjs/swagger` and `swagger-ui-express` as shared dependencies
- Bootstrap `SwaggerModule` in both `apps/catalog` and `apps/concertseats` `main.ts`
- Annotate existing controllers and DTOs with `@nestjs/swagger` decorators (`@ApiTags`, `@ApiOperation`, `@ApiResponse`, `@ApiProperty`, etc.)
- Swagger UI served at `/api/docs` on each service in non-production environments

## Capabilities

### New Capabilities

- `swagger-setup`: Bootstrap and configure SwaggerModule in each NestJS app (catalog, concertseats), serving Swagger UI and the OpenAPI JSON spec

### Modified Capabilities

- `catalog-show-listing`: Add `@ApiTags`, `@ApiOperation`, and `@ApiResponse` decorators to the show listing endpoint and its response DTO
- `catalog-show-detail`: Add OpenAPI annotations to the show detail endpoint and response DTO
- `catalog-show-publish`: Add OpenAPI annotations to the publish endpoint
- `catalog-show-seats`: Add OpenAPI annotations to the seats endpoint and seat definition response DTO

## Impact

- `apps/catalog/src/main.ts` — SwaggerModule bootstrap added
- `apps/concertseats/src/main.ts` — SwaggerModule bootstrap added
- `apps/catalog/src/shows/shows.controller.ts` — decorator annotations
- `apps/catalog/src/shows/dto/` — `@ApiProperty` on response DTOs
- `apps/catalog/src/seat-definitions/dto/` — `@ApiProperty` on response DTOs
- `package.json` — new deps: `@nestjs/swagger`, `swagger-ui-express`
- No Kafka topics or events involved; purely HTTP/REST documentation layer

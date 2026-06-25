## Why

The previous Swagger implementation manually applied `@ApiProperty()` to every DTO field and `@ApiResponse({ type: X })` to every controller method returning a 200. This creates maintenance overhead: every time a DTO changes, the decorators must be kept in sync manually. The `@nestjs/swagger` CLI plugin solves this by introspecting TypeScript types at compile time, making those decorators redundant.

## What Changes

- Enable the `@nestjs/swagger` CLI plugin in `nest-cli.json` for both the `catalog` and `concertseats` projects
- Remove all `@ApiProperty()` decorators from `ShowResponseDto` and `SeatDefinitionResponseDto` — the plugin infers property metadata from TypeScript types
- Remove `@ApiResponse({ status: 200, type: ... })` decorators from controller methods — the plugin infers the 200 response schema from the method's return type annotation
- Remove `@ApiParam` decorators — the plugin infers path/query params from `@Param()` and `@Query()` decorators
- Retain `@ApiTags`, `@ApiOperation`, and non-2xx `@ApiResponse` decorators, which the plugin cannot infer

## Capabilities

### Modified Capabilities

- `swagger-setup`: Enable `@nestjs/swagger` CLI plugin in `nest-cli.json` per-project `compilerOptions`
- `catalog-show-listing`: Remove redundant `@ApiResponse({ status: 200 })` from `GET /shows`
- `catalog-show-detail`: Remove redundant `@ApiResponse({ status: 200 })` and `@ApiParam` from `GET /shows/:id`
- `catalog-show-publish`: Remove redundant `@ApiResponse({ status: 200 })` and `@ApiParam` from `PATCH /shows/:id/publish`
- `catalog-show-seats`: Remove redundant `@ApiResponse({ status: 200 })` and `@ApiParam` from `GET /shows/:id/seats`

## Impact

- `nest-cli.json` — add `"plugins": ["@nestjs/swagger"]` to `compilerOptions` for `catalog` and `concertseats`
- `apps/catalog/src/shows/dto/show-response.dto.ts` — remove all `@ApiProperty()` decorators and `@nestjs/swagger` import
- `apps/catalog/src/seat-definitions/dto/seat-definition-response.dto.ts` — remove all `@ApiProperty()` decorators and `@nestjs/swagger` import
- `apps/catalog/src/shows/shows.controller.ts` — strip `@ApiResponse({ status: 200 })` and `@ApiParam` decorators; trim `@nestjs/swagger` imports
- No changes to Kafka, events, or contracts
- Runtime behaviour is unchanged; only build-time metadata generation shifts from manual to plugin-driven

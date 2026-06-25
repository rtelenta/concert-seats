## 1. Enable the Swagger CLI Plugin

- [x] 1.1 Add `"plugins": ["@nestjs/swagger"]` to `catalog`'s `compilerOptions` in `nest-cli.json`
- [x] 1.2 Add `"plugins": ["@nestjs/swagger"]` to `concertseats`'s `compilerOptions` in `nest-cli.json`

## 2. Strip Redundant DTO Decorators

- [x] 2.1 Remove all `@ApiProperty()` decorators and the `@nestjs/swagger` import from `apps/catalog/src/shows/dto/show-response.dto.ts`
- [x] 2.2 Remove all `@ApiProperty()` decorators and the `@nestjs/swagger` import from `apps/catalog/src/seat-definitions/dto/seat-definition-response.dto.ts`

## 3. Strip Redundant Controller Decorators

- [x] 3.1 Remove `@ApiParam` and `@ApiResponse({ status: 200 })` decorators from all routes in `apps/catalog/src/shows/shows.controller.ts`; trim the `@nestjs/swagger` import to only what remains needed (`ApiTags`, `ApiOperation`, `ApiResponse`)

## 4. Verify

- [x] 4.1 Run `pnpm exec nest build catalog` and confirm it compiles without errors

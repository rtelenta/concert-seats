## Approach

Enable the `@nestjs/swagger` CLI plugin via `nest-cli.json`. The plugin hooks into the TypeScript compiler and emits property metadata for DTO classes at build time, making manual `@ApiProperty()` decorators redundant. It also introspects controller return type annotations to emit the 200 response schema, making `@ApiResponse({ status: 200, type: X })` redundant. Path params decorated with `@Param()` are inferred too, removing the need for `@ApiParam()`.

No runtime changes — only build-time metadata generation shifts from manual decorators to the plugin.

## Architecture

```
nest-cli.json
  catalog.compilerOptions.plugins:   ["@nestjs/swagger"]
  concertseats.compilerOptions.plugins: ["@nestjs/swagger"]

apps/catalog/src/shows/dto/show-response.dto.ts
  BEFORE: @ApiProperty() on every field
  AFTER:  plain TS class — plugin emits metadata

apps/catalog/src/seat-definitions/dto/seat-definition-response.dto.ts
  BEFORE: @ApiProperty() on every field
  AFTER:  plain TS class — plugin emits metadata

apps/catalog/src/shows/shows.controller.ts
  BEFORE: @ApiParam + @ApiResponse({ status: 200, type }) on every route
  AFTER:  @ApiTags + @ApiOperation + non-2xx @ApiResponse only
```

## Key Decisions

- **Plugin scope**: Added per-project in `nest-cli.json` rather than at the root `compilerOptions`. Root-level options apply to the default app only in NestJS monorepo mode; per-project is explicit and correct.
- **Keep `@ApiOperation`**: The plugin does not generate operation summaries from method names. Retaining these gives the Swagger UI meaningful human-readable labels.
- **Keep non-2xx `@ApiResponse`**: The plugin cannot infer error responses — 404 and 422 remain explicitly decorated.
- **`classValidatorShim` not needed**: No `class-validator` decorators are in use on these DTOs.

## Trade-offs

| Option | Pro | Con | Decision |
|---|---|---|---|
| Plugin per-project in nest-cli.json | Explicit, correct monorepo behaviour | Slightly more config | Chosen |
| Plugin at root compilerOptions | Less config | Only applies to default app in monorepo mode | Avoided |
| Keep all decorators | Explicit docs everywhere | Manual upkeep, drift risk | Replaced with plugin |

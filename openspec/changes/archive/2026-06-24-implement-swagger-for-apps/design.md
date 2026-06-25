## Approach

Install `@nestjs/swagger` and `swagger-ui-express` at the monorepo root (`package.json`). Both are passive additions — they only affect startup code and decorators, with no runtime overhead in production if gated.

Bootstrap `SwaggerModule` in each app's `main.ts` before `app.listen`. Gate Swagger UI behind a `NODE_ENV !== 'production'` check so it is never exposed in production. Serve the UI at `/api/docs` and the raw JSON spec at `/api/docs-json`.

Annotate controllers with `@ApiTags` (grouping) and `@ApiOperation` / `@ApiResponse` per route. Annotate response DTOs with `@ApiProperty`. No request-body DTOs exist for the endpoints being documented in this change.

## Architecture

```
apps/catalog/src/main.ts
  └── SwaggerModule.setup('api/docs', app, document)

apps/concertseats/src/main.ts
  └── SwaggerModule.setup('api/docs', app, document)

apps/catalog/src/shows/
  ├── shows.controller.ts       ← @ApiTags, @ApiOperation, @ApiResponse
  └── dto/
      ├── show-response.dto.ts  ← @ApiProperty on each field
      └── seat-definition-response.dto.ts  ← @ApiProperty on each field
```

## Key Decisions

- **Scope**: Catalog app gets full annotation; concertseats app gets SwaggerModule bootstrap with `@ApiTags` on the root controller only (it has no domain controllers yet).
- **Production gate**: Checked via `process.env.NODE_ENV !== 'production'` in `main.ts`, not via config module, to keep bootstrap code minimal.
- **No global prefix change**: `/api/docs` path uses the raw express prefix, not NestJS global prefix, to avoid conflicts.
- **`swagger-ui-express` version**: Pulled transitively by `@nestjs/swagger` — no explicit version pin needed.

## Trade-offs

| Option | Pro | Con | Decision |
|---|---|---|---|
| Gate swagger by NODE_ENV | Simple, zero config | Must set NODE_ENV=production in prod | Chosen — conventional |
| Gate swagger by config flag | More explicit | Requires new config key and env var | Skip — overkill |
| Add swagger to all DTO classes | Complete docs | Many DTOs don't exist yet | Partial — document existing DTOs only |

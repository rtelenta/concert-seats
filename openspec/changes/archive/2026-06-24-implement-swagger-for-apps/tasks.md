## 1. Install Dependencies

- [x] 1.1 Add `@nestjs/swagger` and `swagger-ui-express` to root `package.json` dependencies and run `pnpm install`

## 2. Bootstrap SwaggerModule

- [x] 2.1 Add `SwaggerModule` bootstrap (gated on `NODE_ENV !== 'production'`) to `apps/catalog/src/main.ts`, serving UI at `/api/docs`
- [x] 2.2 Add `SwaggerModule` bootstrap (gated on `NODE_ENV !== 'production'`) to `apps/concertseats/src/main.ts`, serving UI at `/api/docs`

## 3. Annotate Catalog Controllers and DTOs

- [x] 3.1 Add `@ApiTags('shows')`, `@ApiOperation`, and `@ApiResponse` decorators to `apps/catalog/src/shows/shows.controller.ts` for all four endpoints (`GET /shows`, `GET /shows/:id`, `PATCH /shows/:id/publish`, `GET /shows/:id/seats`)
- [x] 3.2 Add `@ApiProperty` to all fields in the show response DTO (file under `apps/catalog/src/shows/dto/`)
- [x] 3.3 Add `@ApiProperty` to all fields in the seat definition response DTO (file under `apps/catalog/src/seat-definitions/dto/` or equivalent)

## 4. Verify

- [x] 4.1 Start the catalog service (`pnpm start:dev catalog`) and confirm `GET http://localhost:<port>/api/docs` returns the Swagger UI with all four show endpoints listed

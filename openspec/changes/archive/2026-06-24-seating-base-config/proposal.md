## Why

The `apps/seating` service was scaffolded with `nest generate app` and is still the bare hello-world template — no config, telemetry, database, Kafka, health, or Swagger. Before any domain logic (consuming `ShowPublished` to build a seat read model) can land, the service needs the same infrastructure baseline already established in `catalog` and `concertseats`, so it can be run, observed, traced, and debugged consistently.

## What Changes

- Replace the scaffold `SeatingModule`/`SeatingController`/`SeatingService` with an `AppModule` + `AppController` matching the convention used by `catalog` and `concertseats`.
- Add `GET /health` returning `{ status: 'ok' }` and `GET /` redirecting to `health`.
- Add `config/app.config.ts` reading `SEATING_PORT`, `SEATING_DATABASE_URL`, and `KAFKA_BROKERS`.
- Wire `ConfigModule` (global), `TelemetryModule` (`serviceName: 'seating'`), `TypeOrmModule` (own Postgres DB via `SEATING_DATABASE_URL`, `autoLoadEntities`, migrations table `seating_migrations`), and `KafkaModule` (clientId/groupId `seating`) into `AppModule`.
- Rewrite `main.ts` to call `bootstrapTelemetry` before `NestFactory.create`, serve Swagger UI at `/docs` in non-production, and listen on the configured port.
- Add `database/data-source.ts` for the TypeORM migration CLI, pointing at `SEATING_DATABASE_URL` with the `seating_migrations` table.
- Register the `@nestjs/swagger` CLI plugin for the `seating` project in `nest-cli.json`.
- Update the e2e test to assert `/health` instead of the hello-world root.
- No Kafka topics are produced or consumed in this change; the `KafkaModule` is only wired so subsequent changes can subscribe to `show-events`. No event/command types are introduced.

## Capabilities

### New Capabilities
- `seating-base-config`: the infrastructure baseline for the seating service — health endpoint, config, telemetry, own Postgres database, Kafka client wiring, and Swagger UI.

### Modified Capabilities
- `swagger-setup`: the catalog of apps bootstrapping Swagger gains `seating` alongside `catalog` and `concertseats`.

## Impact

- `apps/seating/src/` — rename scaffold files to `app.module.ts`/`app.controller.ts`, drop `SeatingService`, add `config/app.config.ts` and `database/data-source.ts`, rewrite `main.ts`.
- `apps/seating/src/seating.controller.spec.ts`, `apps/seating/test/app.e2e-spec.ts` — update to the new `AppModule`/`AppController` and `/health`.
- `nest-cli.json` — add `@nestjs/swagger` plugin entry under the `seating` project so DTO schemas render in docs.
- No new npm dependencies (all used packages are already in `package.json`).
- No database migration is generated in this change (no entities yet); `data-source.ts` is added so future changes can run `migration:generate:seating`.
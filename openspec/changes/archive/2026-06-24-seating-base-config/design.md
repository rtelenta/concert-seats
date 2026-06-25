## Context

`apps/seating` was scaffolded with `nest generate app seating` and is still the bare hello-world template (`SeatingModule`, `SeatingController` returning "Hello World!", `SeatingService`). The other two services — `catalog` and `concertseats` — already share a consistent infrastructure baseline: global `ConfigModule`, `TelemetryModule`, `TypeOrmModule` (per-service Postgres), `KafkaModule`, a `GET /health` endpoint, and Swagger UI at `/docs`. The seating service needs the same baseline before any domain work (consuming `ShowPublished` to build a seat read model) can be layered on.

## Goals / Non-Goals

**Goals:**
- Bring `apps/seating` to the same infrastructure baseline as `catalog`: config, telemetry, own Postgres DB, Kafka client, `/health`, Swagger.
- Match the existing file/naming conventions (`AppModule`, `AppController`, `config/app.config.ts`, `database/data-source.ts`).
- Keep the change to one service — `seating` only.

**Non-Goals:**
- No domain entities, migrations, or seeders (no seating tables yet).
- No Kafka topics produced or consumed — the `KafkaModule` is wired but idle.
- No consumer logic, idempotency, or DLQ — those land with the first `ShowPublished` consumer in a later change.
- No new npm dependencies (everything needed is already in `package.json`).

## Decisions

### Use the `catalog` app as the reference template
`catalog` is the fullest service (config + telemetry + DB + Kafka + health + Swagger). `seating` will mirror its `main.ts`, `app.module.ts`, `config/app.config.ts`, and `database/data-source.ts` shape, swapping service-specific values (`seating`, `SEATING_*`, `seating_migrations`).

### Rename the scaffold to `AppModule` / `AppController`
The `nest generate app` scaffold produced `SeatingModule`/`SeatingController`/`SeatingService`. The other services use `AppModule` in `app.module.ts` as the root and `AppController` in `app.controller.ts` for the root + `/health` handlers. Renaming keeps the codebase uniform and lets feature modules (`ShowsModule`-style) be added later without a root rename. The hello-world `SeatingService` is dropped — `catalog`'s `AppController` is stateless and needs no service.

### Per-service env prefix `SEATING_`
Following `catalog` (`CATALOG_PORT`, `CATALOG_DATABASE_URL`) and `concertseats` (`CONCERTSEATS_PORT`), seating uses `SEATING_PORT` and `SEATING_DATABASE_URL`. `KAFKA_BROKERS` stays shared (single Redpanda cluster), matching the existing `app.config.ts` convention.

### Migrations table `seating_migrations`
Each service owns a migration table in its own DB (`catalog_migrations` for catalog). Seating uses `seating_migrations` so its migration history is isolated.

### Swagger path `/docs`
The existing `catalog` and `concertseats` implementations serve Swagger at `/docs` (via `SwaggerModule.setup('/docs', ...)`). Seating matches the implementations, not the cross-cutting `swagger-setup` spec's `/api/docs` wording — consistency across the running services takes priority, and the spec/impl path mismatch is a pre-existing issue beyond this change's scope.

### Add `@nestjs/swagger` CLI plugin to `seating` in `nest-cli.json`
Catalog and concertseats both have `"plugins": ["@nestjs/swagger"]` under their `nest-cli.json` project entries so DTO schemas render without manual `@ApiProperty()`. Seating currently lacks it; adding it now means future DTOs are automatically documented.

## Risks / Trade-offs

- [Risk: `KafkaModule` connects to Redpanda on boot but nothing consumes] → Mitigation: the module already tolerates an idle client; no consumer is subscribed, so no overhead. This matches `catalog`, which wires Kafka and only produces on publish.
- [Risk: `TypeOrmModule` fails to boot without `SEATING_DATABASE_URL`] → Mitigation: expected — the service cannot run without its DB, same as `catalog`. Local dev must set the env var; `infra:up` provides a Postgres.
- [Risk: Pre-existing `swagger-setup` spec says `/api/docs` but impls use `/docs`] → Mitigation: not introduced by this change; documented here so the reviewer is aware. Seating follows the impl convention.
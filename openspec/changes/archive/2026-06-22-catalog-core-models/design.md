## Context

The catalog service is a NestJS app with `ConfigModule` and `TelemetryModule` wired up but no persistence layer. No ORM or database driver is present in the monorepo yet. The target database is Neon (serverless Postgres) with `sslmode=require`, accessed via a connection string in `CATALOG_DATABASE_URL`.

## Goals / Non-Goals

**Goals:**
- Introduce TypeORM with `@nestjs/typeorm` as the catalog service's persistence layer.
- Define TypeORM entities and Postgres migrations for `venues`, `shows`, and `seat_definitions`.
- Implement a `ShowsService` that enforces the `DRAFT → PUBLISHED / CANCELLED` state machine.
- Expose thin repository-backed modules for each entity so future HTTP and event modules can import them.

**Non-Goals:**
- HTTP REST endpoints (a separate change).
- Kafka event emission on status changes (a separate change).
- Shared database infrastructure across services — each service owns its own schema.

## Decisions

### Use TypeORM over Drizzle
TypeORM has first-class `@nestjs/typeorm` integration (module helpers, entity injection via `@InjectRepository`, migration CLI) that fits the existing NestJS patterns in the codebase. Drizzle is leaner for serverless edges but requires more manual wiring; TypeORM is the lower-friction choice for a NestJS monorepo.

### Use TypeORM CLI migrations (not `synchronize: true`)
`synchronize: true` is unsafe in production: it auto-alters tables on startup. Instead, TypeORM migration files are generated via `typeorm migration:generate` and run via `typeorm migration:run`. This gives an auditable, reversible migration history.

### Show status as a Postgres native enum
Defining `show_status` as a Postgres `ENUM` type (`DRAFT`, `PUBLISHED`, `CANCELLED`) rather than a `varchar` with a check constraint gives a cleaner column type in tooling and prevents arbitrary string insertion at the DB level. TypeORM supports native enums via `@Column({ type: 'enum', enum: ShowStatus })`.

### Status transition enforcement in the service layer
The `ShowsService` (not the database) enforces the state machine. A `DRAFT → PUBLISHED` or `DRAFT → CANCELLED` guard runs before any `UPDATE`. The DB acts as durable storage; domain invariants live in the service. This keeps the migration simple (no triggers) and the logic testable.

### Unique index on seat_definitions `(show_id, section, row, number)`
Enforced both as a TypeORM `@Unique` decorator (for entity-level clarity) and as a Postgres unique constraint in the migration (the authoritative guard). The application layer surfaces a `ConflictException` when the constraint fires.

## Risks / Trade-offs

- **Neon serverless cold-start with connection pooling** → Use `@neondatabase/serverless` driver or `pg` with a small pool (`max: 2`) to avoid exhausting Neon's connection limits. If connection exhaustion becomes an issue, add PgBouncer or switch to the Neon HTTP driver.
- **Migration drift** → Migrations must be committed alongside entity changes. CI should fail if entity changes exist without a matching migration file.
- **No seed data** → Venues and shows must be created programmatically; there is no seed script in scope.

## Migration Plan

1. Install `@nestjs/typeorm`, `typeorm`, and `pg` in the monorepo.
2. Wire `TypeOrmModule.forRootAsync` in `AppModule` using `CATALOG_DATABASE_URL` from config.
3. Add entity files and run `typeorm migration:generate` to produce the initial migration.
4. Run `typeorm migration:run` against the Neon dev database.
5. Rollback: `typeorm migration:revert` drops the last migration in reverse.

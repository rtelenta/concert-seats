## Context

The catalog service has three domain entities — `Venue`, `Show`, and `SeatDefinition` — with FK dependencies in that order. Currently there is no initial data, so developers must insert rows manually before testing any feature that depends on catalog data. A standalone seeder script run against the existing TypeORM `DataSource` solves this without touching application runtime code.

## Goals / Non-Goals

**Goals:**
- Provide a single `pnpm run seed:catalog` command that populates the DB with a realistic, minimal dataset
- Respect FK order: venues are inserted before shows, shows before seat definitions
- Be idempotent: re-running never duplicates rows
- Work in any environment that has `CATALOG_DATABASE_URL` set (local, CI, staging)

**Non-Goals:**
- No Kafka events emitted — seeders are a dev tool, not domain operations
- No new HTTP endpoints or NestJS modules
- No production data migration — this is development tooling only
- No seed data for services other than catalog

## Decisions

### Standalone script over NestJS bootstrap

Running `AppModule` to seed would pull in all service dependencies (Kafka, telemetry). Instead, the seeder instantiates only `AppDataSource` directly and runs in a plain Node script. This keeps startup fast and dependency-free.

**Alternatives considered:**
- `TypeORM seeding libraries` (typeorm-seeding, typeorm-extension): adds a dep and conventions we don't need; plain TypeScript is simpler and easier to audit.
- `NestJS CLI plugin`: requires the full app context; overkill for a script.

### Upsert via `ON CONFLICT DO NOTHING`

Each seeder uses `createQueryBuilder().insert().orIgnore()` (maps to `INSERT … ON CONFLICT DO NOTHING`). UUIDv7 IDs are stable per seed file (hard-coded), so a conflict means "row already exists" and skipping is the right behaviour.

**Alternatives considered:**
- `DELETE + re-insert`: destructive and breaks FK constraints if other data references seeded rows.
- Check-then-insert: two round-trips and a TOCTOU race — upsert is atomic.

### Seed data shape

Each seeder exports a plain constant array of entity-shaped objects. The entry point imports them in dependency order and runs them sequentially inside a single transaction.

## Risks / Trade-offs

- **Hard-coded UUIDs** → Mitigation: document that these IDs are stable dev fixtures; they should never appear in production data.
- **Transaction wraps all seeders** → If venue seeding fails, no partial show data is left behind. Downside: a single bad row rolls back all seeders — acceptable for a dev tool.
- **Neon SSL required** → `DataSource` already has `ssl: { rejectUnauthorized: false }`, so local `.env` with `CATALOG_DATABASE_URL` is sufficient.

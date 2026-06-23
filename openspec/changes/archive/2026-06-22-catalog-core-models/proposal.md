## Why

The catalog service is bootstrapped but has no domain entities. Without `venues`, `shows`, and `seat_definitions` in the database, no other service can reference show or seat data and the system cannot support any concert workflow.

## What Changes

- Add Postgres migrations and TypeORM entities for `venues`, `shows`, and `seat_definitions` in `apps/catalog`.
- Enforce a `show.status` state machine: only `DRAFT → PUBLISHED` and `DRAFT → CANCELLED` are valid transitions.
- Expose repository-layer CRUD for all three entities so higher-level modules can build on them.

## Capabilities

### New Capabilities

- `venue-management`: Create and read venues (id, name, city, capacity). Required FK dependency for shows.
- `show-management`: Full lifecycle management of shows with a status state machine (DRAFT → PUBLISHED / CANCELLED).
- `seat-definition-management`: Per-show seat layout (section, row, number, price) with a unique constraint on `(show_id, section, row, number)` to prevent duplicate seat definitions.

### Modified Capabilities

<!-- No existing spec-level requirements are changing. -->

## Impact

- **apps/catalog**: New database migrations, TypeORM entities, and repositories for `venues`, `shows`, and `seat_definitions`.
- **Database**: Neon (serverless Postgres) schema for the catalog service; `sslmode=require`.
- **Downstream**: Future changes will build on these entities to emit events and expose HTTP endpoints.

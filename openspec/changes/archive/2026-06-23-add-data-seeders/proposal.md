## Why

The catalog service has Venue, Show, and SeatDefinition entities with no initial data, making local development and manual testing difficult — developers must hand-craft SQL or API calls before they can work with any real data. Adding seeders gives everyone a reproducible starting state in one command.

## What Changes

- New `SeedModule` in the catalog service that seeds a set of venues, shows, and seat definitions in dependency order (venues first, then shows referencing them, then seat definitions referencing shows)
- A `seed` npm script on the catalog app that invokes the seeder directly via TypeORM's `DataSource` (no HTTP server required)
- Seed data covers at least 2 venues, 3 shows across those venues, and a realistic seat map (multiple sections, rows, and numbered seats) per show
- Seeder is idempotent: re-running it does not create duplicates (upsert or skip-if-exists)

## Capabilities

### New Capabilities

- `catalog-data-seeding`: Seed script that populates venues, shows, and seat definitions in the catalog database for local development

### Modified Capabilities

<!-- No existing spec-level requirements are changing -->

## Impact

- **Files added**: `apps/catalog/src/database/seed.ts` (entry point), `apps/catalog/src/database/seeders/venue.seeder.ts`, `apps/catalog/src/database/seeders/show.seeder.ts`, `apps/catalog/src/database/seeders/seat-definition.seeder.ts`
- **`package.json`**: new `seed:catalog` script under the catalog app
- **No Kafka events**: seeders write directly to the DB; they are a dev tool, not a domain operation
- **No schema changes**: uses existing entities and migration; no new migration needed

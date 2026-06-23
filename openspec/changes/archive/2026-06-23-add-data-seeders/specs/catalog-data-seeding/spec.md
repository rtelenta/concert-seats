## ADDED Requirements

### Requirement: Seed script populates venues
The seeder SHALL insert at least 2 `Venue` rows into the `venues` table. Each row MUST supply all non-nullable fields: `id` (UUIDv7, stable across runs), `name`, `city`, `capacity`.

#### Scenario: First run on empty database
- **GIVEN** the `venues` table is empty
- **WHEN** the seed script is executed
- **THEN** at least 2 venue rows are present in `venues`

#### Scenario: Idempotent re-run
- **GIVEN** the `venues` table already contains the seeded rows
- **WHEN** the seed script is executed again
- **THEN** the row count does not increase and no error is thrown

### Requirement: Seed script populates shows
The seeder SHALL insert at least 3 `Show` rows into the `shows` table, each referencing a seeded venue via `venue_id`. Each row MUST supply all non-nullable fields: `id`, `title`, `artist`, `date_time`, `venue_id`, `status` (defaulting to `PUBLISHED`).

#### Scenario: Shows reference valid venues
- **GIVEN** the venue seed has already run
- **WHEN** the show seed runs
- **THEN** every inserted show's `venue_id` matches an existing row in `venues`

#### Scenario: Idempotent re-run
- **GIVEN** the `shows` table already contains the seeded rows
- **WHEN** the seed script is executed again
- **THEN** the row count does not increase and no error is thrown

### Requirement: Seed script populates seat definitions
The seeder SHALL insert seat definitions for each seeded show, covering at least 2 sections with multiple rows and numbered seats. Each row MUST supply all non-nullable fields: `id`, `show_id`, `section`, `row`, `number`, `price`.

#### Scenario: Seat definitions reference valid shows
- **GIVEN** the show seed has already run
- **WHEN** the seat-definition seed runs
- **THEN** every inserted seat definition's `show_id` matches an existing row in `shows`

#### Scenario: Unique constraint respected
- **GIVEN** a seat definition with a given `(show_id, section, row, number)` already exists
- **WHEN** the seed script is executed again
- **THEN** no duplicate row is inserted and no error is thrown

### Requirement: Seed runs in dependency order within a transaction
The seeder entry point SHALL run venue, show, and seat-definition seeders sequentially in that order, wrapped in a single database transaction.

#### Scenario: Failure rolls back all seeders
- **GIVEN** venue and show seeds succeed but seat-definition seeding fails
- **WHEN** the transaction is rolled back
- **THEN** no seeded venues, shows, or seat definitions are persisted

#### Scenario: Successful run commits all data
- **GIVEN** all three seeders complete without error
- **WHEN** the transaction commits
- **THEN** all venues, shows, and seat definitions are visible in the database

### Requirement: Seed invocable via npm script
A `seed:catalog` script SHALL be available in the root `package.json` that runs the catalog seeder with `ts-node` (or equivalent) using the `CATALOG_DATABASE_URL` environment variable.

#### Scenario: Running the script
- **WHEN** `pnpm run seed:catalog` is executed with `CATALOG_DATABASE_URL` set
- **THEN** the seeder completes without error and exits with code 0

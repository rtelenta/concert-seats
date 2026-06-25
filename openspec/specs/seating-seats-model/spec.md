# Spec: seating-seats-model

## Purpose

Defines the `seats` read-model table, its TypeORM `Seat` entity, the `SeatStatus` enum, and the migration that creates them in the seating service's own Postgres database. The seating service owns this data free of cross-service foreign keys.

## Requirements

### Requirement: Seating service persists seats in its own database
The seating service SHALL own a `seats` table in its own Postgres database (managed via the `seating_migrations` table). The table SHALL be created by a TypeORM migration and mapped by a `Seat` entity registered through `SeatsModule` (`TypeOrmModule.forFeature([Seat])`) so it is loaded at runtime via `autoLoadEntities`. The service MUST NOT define a foreign key to any other service's database.

#### Scenario: Seats table is created by migration
- **WHEN** `pnpm migration:run:seating` is executed against the seating database
- **THEN** a `seats` table exists in the seating database and the migration is recorded in the `seating_migrations` table

#### Scenario: Seat entity is registered at runtime
- **WHEN** the seating service boots
- **THEN** the `Seat` entity is loaded by `TypeOrmModule` via `autoLoadEntities` (registered through `SeatsModule`'s `TypeOrmModule.forFeature([Seat])` import) and is queryable through a repository

### Requirement: Seats table schema matches the seat read-model
The `seats` table SHALL have the columns and constraints defined here. Each row represents one seat for one show, denormalized from the `ShowPublished` event.

Columns:
- `seat_id` uuid PRIMARY KEY
- `show_id` uuid NOT NULL
- `seat_definition_id` uuid NOT NULL
- `section` varchar(50) NOT NULL
- `row` varchar(10) NOT NULL
- `number` integer NOT NULL
- `price` numeric(10,2) NOT NULL
- `status` `seat_status` enum (`AVAILABLE`, `HELD`, `SOLD`) NOT NULL DEFAULT `AVAILABLE`
- `held_by` varchar NULL
- `held_until` timestamptz NULL
- `version` integer NOT NULL DEFAULT 0 — optimistic-lock counter (TypeORM `@VersionColumn`)

Constraints:
- UNIQUE on `seat_definition_id`
- INDEX on `show_id`

#### Scenario: Table columns and types are correct
- **WHEN** the schema of the `seats` table is inspected after running the migration
- **THEN** it contains exactly the columns `seat_id` (uuid, PK), `show_id` (uuid), `seat_definition_id` (uuid), `section` (varchar(50)), `row` (varchar(10)), `number` (integer), `price` (numeric(10,2)), `status` (enum `seat_status`), `held_by` (varchar, nullable), `held_until` (timestamptz, nullable), and `version` (integer), with no other columns

#### Scenario: Status defaults to AVAILABLE and version defaults to 0
- **WHEN** a row is inserted into `seats` without an explicit `status` or `version`
- **THEN** `status` resolves to `AVAILABLE` and `version` resolves to `0`

#### Scenario: seat_definition_id is unique
- **WHEN** a second row is inserted with a `seat_definition_id` already present in the table
- **THEN** the insert is rejected with a unique-constraint violation

### Requirement: SeatStatus enum is defined in the seating service
The seating service SHALL define a `SeatStatus` enum in `apps/seating/src/seats/seat-status.enum.ts` with members `AVAILABLE`, `HELD`, and `SOLD`. The enum SHALL be persisted as a Postgres enum named `seat_status` via the TypeORM entity's `@Column({ type: 'enum', enum: SeatStatus, enumName: 'seat_status' })` configuration.

#### Scenario: Enum members match the read-model states
- **WHEN** the `SeatStatus` enum source is inspected
- **THEN** it has exactly the members `AVAILABLE`, `HELD`, and `SOLD`

#### Scenario: Postgres enum is created by migration
- **WHEN** `pnpm migration:run:seating` is executed against an empty seating database
- **THEN** a Postgres enum type `seat_status` with values `AVAILABLE`, `HELD`, `SOLD` is created and used by the `status` column of the `seats` table
## Why

The seating service was just given its infrastructure baseline (config, telemetry, DB, Kafka) but has no domain model. Its first job is to hold a per-show seat read-model populated by consuming `ShowPublished` events (and later mutated by hold/sell commands). Before any consumer or booking logic lands, the `seats` table and its TypeORM entity must exist so subsequent changes can project events and apply optimistic-locked state transitions against a stable schema.

## What Changes

- Add a `Seat` TypeORM entity in `apps/seating/src/seats/seat.entity.ts` mapped to a `seats` table in the seating service's own Postgres database (no cross-service FK).
- Add a `SeatStatus` enum (`AVAILABLE`, `HELD`, `SOLD`) under `apps/seating/src/seats/seat-status.enum.ts`, persisted as a Postgres enum `seat_status` defaulting to `AVAILABLE`.
- Add a `SeatsModule` that registers the entity via `TypeOrmModule.forFeature([Seat])` and import it into `AppModule` so `autoLoadEntities` includes it at runtime.
- Add `migration:generate:seating`, `migration:run:seating`, and `migration:revert:seating` scripts to `package.json` (mirroring the `catalog` scripts).
- Generate and run the initial migration creating the `seats` table and the `seat_status` enum in the seating database.

### Column shape (exact)

| property (camelCase) | column (snake_case) | type | notes |
|---|---|---|---|
| `seatId` | `seat_id` | uuid | PK, uuid v7 generated on insert |
| `showId` | `show_id` | uuid | indexed; the projection partition key |
| `seatDefinitionId` | `seat_definition_id` | uuid | UNIQUE; cross-service ref to catalog `seat_definitions.id`, no FK |
| `section` | `section` | varchar(50) | denormalized from the event |
| `row` | `row` | varchar(10) | denormalized from the event |
| `number` | `number` | int | denormalized from the event |
| `price` | `price` | numeric(10,2) | denormalized from the event |
| `status` | `status` | enum `seat_status` | `AVAILABLE` \| `HELD` \| `SOLD`, default `AVAILABLE` |
| `heldBy` | `held_by` | varchar | nullable; userId propagated from the gateway |
| `heldUntil` | `held_until` | timestamptz | nullable; expiry of a hold |
| `version` | `version` | int | optimistic-lock counter via TypeORM `@VersionColumn` |

This change does NOT introduce or consume any Kafka topic, produce or consume any event, or add a controller/service with behavior. No event/command types are added to `@app/contracts`. The form of this table is designed to be filled later by a `ShowPublished` consumer on the `show-events` topic (keyed by `showId`, groupId `seating`).

## Capabilities

### New Capabilities
- `seating-seats-model`: the `seats` read-model table, its TypeORM entity, and the migration that creates it in the seating service's own database.

### Modified Capabilities
<!-- None. No existing spec-level behavior changes. -->

## Impact

- `apps/seating/src/seats/seat-status.enum.ts` (new) — the `SeatStatus` enum.
- `apps/seating/src/seats/seat.entity.ts` (new) — the `Seat` entity with the columns above; `@VersionColumn` for optimistic locking; `@Index` on `show_id`; `@Unique` on `seat_definition_id`.
- `apps/seating/src/seats/seats.module.ts` (new) — `SeatsModule` registering `Seat` via `TypeOrmModule.forFeature([Seat])`.
- `apps/seating/src/app.module.ts` — import `SeatsModule`.
- `apps/seating/src/database/migrations/<timestamp>-InitSeating.ts` (new) — generated migration creating the `seat_status` enum and `seats` table.
- `package.json` — add the three `migration:*:seating` scripts.
- No new npm dependencies; TypeORM and `uuid` are already present.
- Requires a provisioned seating Neon database reachable via `SEATING_DATABASE_URL` to run the migration.
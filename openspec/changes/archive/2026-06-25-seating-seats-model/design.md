## Context

The seating service has its baseline (config, telemetry, own Postgres via `SEATING_DATABASE_URL`, Kafka client wired idle, `autoLoadEntities`, `seating_migrations` table, and a `database/data-source.ts` using a `../**/*.entity.{ts,js}` glob). It has no domain model. Its first responsibility is a per-show seat read-model: later, a consumer will project `ShowPublished` events (keyed by `showId`, groupId `seating`) into this table, and later still the booking flow will mutate `status` (`AVAILABLE → HELD → SOLD`) under optimistic locking.

Catalog already establishes the entity conventions: uuid v7 PKs generated in `@BeforeInsert`, camelCase properties mapped to snake_case `name:`, `numeric(10,2)` for `price`, Postgres enums via `enumName`, and `@Unique`/`@Index` decorators. This change follows those patterns exactly.

## Goals / Non-Goals

**Goals:**
- Land the `seats` table schema in the seating database via a generated TypeORM migration, matching the requested column set exactly.
- Register a `Seat` entity + `SeatStatus` enum + `SeatsModule` so the table is usable at runtime and by future consumers/controllers.

**Non-Goals:**
- No Kafka producer/consumer. The `ShowPublished` consumer that populates this table is a separate change (it will live in the `seating` groupId and key by `showId`).
- No hold/sell command, controller, or service behavior. The hold (`status`, `heldBy`, `heldUntil`) and `version` columns exist only to be ready for later writes; this change doesn't mutate them.
- No DTO, controller, or OpenAPI surface.
- No cross-service FK to `catalog.seat_definitions`; `seat_definition_id` is a reference by value only (per the no-cross-service-database-reads rule).

## Decisions

### `seat_id` as PK, not generic `id`
The catalog entities use `id` as the PK column. Here the user explicitly asked for `seatId`, so the property is `seatId` mapped to column `seat_id`. This buys clarity in a read model that also carries `show_id` and `seat_definition_id` references — keeping the seat's own identity visually distinct from its references.

### UNIQUE on `seat_definition_id` (not a composite)
`seat_definition_id` is catalog's uuid v7 PK, globally unique, and the projection maps one `ShowPublished` seat entry to exactly one `seats` row. A UNIQUE on `seat_definition_id` is therefore sufficient to enforce one-row-per-seat-definition and lets idempotent upserts key on it. A composite `(show_id, seat_definition_id)` would be redundant. An INDEX on `show_id` separately supports the common "all seats of a show" lookup.

### `version` via `@VersionColumn`
Use TypeORM's `@VersionColumn({ type: 'int' })` for `version` so updates automatically increment and optimistic-lock the row, rather than hand-rolling a version increment. Default in SQL is `0` (set by the migration), and TypeORM increments on each `save()`.

### Per-service enum name `seat_status`
Mirrors catalog's `show_status` enum pattern: `@Column({ type: 'enum', enum: SeatStatus, enumName: 'seat_status', default: SeatStatus.AVAILABLE })`. The enum lives in the seating service, not `@app/contracts`, because no other service consumes seat state over Kafka yet — when a `SeatHeld`/`SeatSold` event is introduced later, the enum's wire shape moves to `@app/contracts` first per the cross-cutting rule.

### Migration scripts mirror catalog
Add `migration:generate:seating`, `migration:run:seating`, `migration:revert:seating` to `package.json` pointing at `apps/seating/src/database/data-source.ts`, matching the existing catalog scripts. Required so the generate+run flow used by the tasks works.

### Generate (not hand-write) the migration
Use `pnpm migration:generate:seating` against an empty seating database so TypeORM produces the `CREATE TYPE seat_status` + `CREATE TABLE seats` + unique/index DDL from the entity, consistent with how the catalog migration was created. Requires `SEATING_DATABASE_URL` pointing at the (empty) seating Neon database.

## Risks / Trade-offs

- [Risk: `migration:generate` needs a live, empty seating DB] → Mitigation: prerequisite noted in tasks; if the env can't reach Neon, fall back to `migration:create` + hand-written DDL. Generate is preferred for parity with catalog.
- [Risk: denormalized `section/row/number/price` drift from catalog over time] → Mitigation: by design — this is a read model snapshot at publish time; the `ShowPublished` envelope is the source of truth for the initial state. Re-publishing (not yet supported) would refresh.
- [Risk: adding `held_by`/`held_until` columns before any writer seems speculative] → Mitigation: explicit request; cheap to land now, avoid a later `ALTER TABLE`, and document future intent in the entity.
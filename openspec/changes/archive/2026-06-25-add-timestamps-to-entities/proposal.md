## Why

Three of the four DB tables (`venues`, `seat_definitions`, `seats`) are missing `created_at` and/or `updated_at` columns. This makes debugging, auditing, and time-based queries impossible for those tables. Adding a shared base entity class enforces the pattern consistently across every current and future entity.

## What Changes

- Introduce an abstract `TimestampedEntity` in each app (`catalog`, `seating`) that provides `@CreateDateColumn created_at` and `@UpdateDateColumn updated_at`.
- Extend it in all four entities (`Show`, `Venue`, `SeatDefinition`, `Seat`), removing any inline timestamp decorators already present.
- Add migrations to backfill the missing columns in the DB.

## Capabilities

### Modified Capabilities

- All existing entities gain consistent `created_at` / `updated_at` columns managed by TypeORM.

## Impact

- **apps/catalog**: new `common/timestamped.entity.ts`; updated `Show`, `Venue`, `SeatDefinition` entities; new migration.
- **apps/seating**: new `common/timestamped.entity.ts`; updated `Seat` entity; new migration.
- **DB changes**: `venues` (add both columns), `seat_definitions` (add `updated_at`), `seats` (add both columns). `shows` already has both — no migration needed there.
- **No API changes** — column additions are transparent to existing consumers.

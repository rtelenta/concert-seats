## 1. Catalog — Base entity

- [x] 1.1 Create `apps/catalog/src/common/timestamped.entity.ts` with abstract `TimestampedEntity` providing `@CreateDateColumn created_at` and `@UpdateDateColumn updated_at`.

## 2. Catalog — Entity updates

- [x] 2.1 Update `Show` entity: extend `TimestampedEntity`, remove its inline `@CreateDateColumn`/`@UpdateDateColumn` decorators.
- [x] 2.2 Update `Venue` entity: extend `TimestampedEntity`.
- [x] 2.3 Update `SeatDefinition` entity: extend `TimestampedEntity`, remove its inline `@CreateDateColumn` decorator.

## 3. Catalog — Migration

- [x] 3.1 Create migration `AddTimestampsToCatalog` in `apps/catalog/src/database/migrations/` that adds `created_at` and `updated_at` to `venues`, and `updated_at` to `seat_definitions` (all `TIMESTAMPTZ NOT NULL DEFAULT now()`).

## 4. Seating — Base entity

- [x] 4.1 Create `apps/seating/src/common/timestamped.entity.ts` with the same abstract `TimestampedEntity`.

## 5. Seating — Entity update

- [x] 5.1 Update `Seat` entity: extend `TimestampedEntity`.

## 6. Seating — Migration

- [x] 6.1 Create migration `AddTimestampsToSeats` in `apps/seating/src/database/migrations/` that adds `created_at` and `updated_at` to `seats` (both `TIMESTAMPTZ NOT NULL DEFAULT now()`).

## 7. Verification

- [x] 7.1 Run `pnpm exec tsc --noEmit` across both apps (no type errors).
- [x] 7.2 Run `pnpm migration:run:catalog` and `pnpm migration:run:seating` to confirm migrations apply cleanly.

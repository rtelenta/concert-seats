## Context

The monorepo has two NestJS apps (`catalog`, `seating`) with separate TypeORM configurations and separate Postgres databases. There are no cross-app entity imports; each app is fully self-contained. A shared `libs/database` library would work but introduces boilerplate (nest-cli, tsconfig paths) for a two-decorator base class. Instead, a per-app abstract class is the right trade-off.

## Goals / Non-Goals

**Goals:**
- Every entity in both apps extends a common `TimestampedEntity` abstract class.
- TypeORM manages `created_at` / `updated_at` automatically on insert/update.
- Existing data in `shows` is unaffected (columns already present).

**Non-Goals:**
- A shared library for the base entity (would require new lib scaffolding for negligible benefit).
- Soft-delete / `deleted_at` (not requested).

## Decisions

### D1 — Per-app abstract `TimestampedEntity`

```
apps/catalog/src/common/timestamped.entity.ts
apps/seating/src/common/timestamped.entity.ts
```

Both files are identical. Duplication is acceptable: the files are trivial and the apps are independently deployable services with no shared TypeORM config.

```ts
export abstract class TimestampedEntity {
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
```

### D2 — Entity refactors

| Entity | Change |
|--------|--------|
| `Show` | Remove inline `@CreateDateColumn`/`@UpdateDateColumn` → extend `TimestampedEntity` |
| `Venue` | Extend `TimestampedEntity` |
| `SeatDefinition` | Remove inline `@CreateDateColumn` → extend `TimestampedEntity` |
| `Seat` | Extend `TimestampedEntity` |

### D3 — One migration per app (not per table)

Combine all column additions for a given app's database into a single migration to keep migration history clean.

**Catalog migration** (`AddTimestampsToCatalog`):
- `ALTER TABLE venues ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT now()`
- `ALTER TABLE venues ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`
- `ALTER TABLE seat_definitions ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`

**Seating migration** (`AddTimestampsToSeats`):
- `ALTER TABLE seats ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT now()`
- `ALTER TABLE seats ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`

`DEFAULT now()` backfills existing rows with the migration time — acceptable for audit purposes.

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| `DEFAULT now()` sets same timestamp for all backfilled rows | Acceptable: no historical data is available; migration timestamp is better than NULL |
| `Show` entity refactor changes nothing at the DB level | Verified: `@CreateDateColumn`/`@UpdateDateColumn` on a base class produce identical DDL |

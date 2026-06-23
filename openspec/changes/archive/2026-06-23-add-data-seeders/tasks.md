## 1. Venue Seeder

- [x] 1.1 Create `apps/catalog/src/database/seeders/venue.seeder.ts` with at least 2 hard-coded venue fixtures (stable UUIDv7 IDs, name, city, capacity)
- [x] 1.2 Insert venues using `orIgnore()` (ON CONFLICT DO NOTHING) so re-runs are idempotent

## 2. Show Seeder

- [x] 2.1 Create `apps/catalog/src/database/seeders/show.seeder.ts` with at least 3 show fixtures referencing the seeded venue IDs
- [x] 2.2 Insert shows using `orIgnore()` for idempotency

## 3. Seat Definition Seeder

- [x] 3.1 Create `apps/catalog/src/database/seeders/seat-definition.seeder.ts` with seat fixtures for each seeded show (at least 2 sections, multiple rows and numbered seats per section)
- [x] 3.2 Insert seat definitions using `orIgnore()` for idempotency

## 4. Entry Point & Script

- [x] 4.1 Create `apps/catalog/src/database/seed.ts` as the entry point: initialise `AppDataSource`, run all three seeders in a single transaction (venues → shows → seat definitions), then destroy the data source
- [x] 4.2 Add a `seed:catalog` script to root `package.json` that runs the entry point via `typeorm-ts-node-commonjs` (matching the existing `migration:*` scripts pattern)

## 5. Verification

- [x] 5.1 Run `pnpm run seed:catalog` against the local DB and confirm it exits with code 0, then query `SELECT count(*) FROM venues`, `shows`, and `seat_definitions` to verify expected row counts

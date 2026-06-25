## 1. Entity and enum

- [x] 1.1 Create `apps/seating/src/seats/seat-status.enum.ts` exporting `enum SeatStatus { AVAILABLE = 'AVAILABLE', HELD = 'HELD', SOLD = 'SOLD' }`
- [x] 1.2 Create `apps/seating/src/seats/seat.entity.ts` exporting the `Seat` entity (`@Entity('seats')`) with: `seatId` PK uuid v7 via `@BeforeInsert` (`name: 'seat_id'`); `showId` uuid (`name: 'show_id'`); `seatDefinitionId` uuid (`name: 'seat_definition_id'`, `@Unique`); `section` varchar(50); `row` varchar(10) (`name: 'row'`); `number` int; `price` numeric(10,2); `status` enum `SeatStatus` (`enumName: 'seat_status'`, default `AVAILABLE`); `heldBy` varchar nullable (`name: 'held_by'`); `heldUntil` timestamptz nullable (`name: 'held_until'`); `version` `@VersionColumn({ type: 'int' })`. Add `@Index` on `show_id`

## 2. Module wiring

- [x] 2.1 Create `apps/seating/src/seats/seats.module.ts` exporting `SeatsModule` that imports `TypeOrmModule.forFeature([Seat])`
- [x] 2.2 Import `SeatsModule` into `apps/seating/src/app.module.ts` (after `KafkaModule`)

## 3. Migration scripts

- [x] 3.1 Add `migration:generate:seating`, `migration:run:seating`, and `migration:revert:seating` scripts to `package.json` pointing at `apps/seating/src/database/data-source.ts` (mirror the existing `:*:catalog` scripts)

## 4. Generate and run the migration

- [x] 4.1 With `SEATING_DATABASE_URL` pointing at an empty seating database, run `pnpm migration:generate:seating apps/seating/src/database/migrations/InitSeating` and confirm a migration file is created with `CREATE TYPE seat_status` + `CREATE TABLE seats` (+ unique and index) DDL
- [x] 4.2 Run `pnpm migration:run:seating` and then query the seating database to confirm the `seats` table exists with the columns `seat_id`, `show_id`, `seat_definition_id`, `section`, `row`, `number`, `price`, `status`, `held_by`, `held_until`, `version` and that a row is recorded in `seating_migrations`

## 5. Verify

- [x] 5.1 Run `pnpm exec nest build seating` and `pnpm test` and confirm both pass
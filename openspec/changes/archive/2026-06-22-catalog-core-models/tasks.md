## 1. Install Dependencies

- [x] 1.1 Add `@nestjs/typeorm`, `typeorm`, and `pg` to the monorepo `package.json` and install

## 2. Database Module

- [x] 2.1 Wire `TypeOrmModule.forRootAsync` in `apps/catalog/src/app.module.ts` using `CATALOG_DATABASE_URL` from config with `sslmode=require` and `synchronize: false`

## 3. Venue Entity and Module

- [x] 3.1 Create `apps/catalog/src/venues/venue.entity.ts` — UUID PK, `name varchar(255)`, `city varchar(100)`, `capacity int`
- [x] 3.2 Create `apps/catalog/src/venues/venues.module.ts` registering the entity and exporting `TypeOrmModule`

## 4. Show Entity and Module

- [x] 4.1 Create `apps/catalog/src/shows/show-status.enum.ts` with `DRAFT | PUBLISHED | CANCELLED`
- [x] 4.2 Create `apps/catalog/src/shows/show.entity.ts` — UUID PK, `venue_id` FK → Venue, `title`, `artist`, `date_time timestamptz`, `status` (native Postgres enum, default DRAFT), `created_at`, `updated_at`
- [x] 4.3 Create `apps/catalog/src/shows/shows.module.ts` registering the entity and exporting `TypeOrmModule`

## 5. Seat Definition Entity and Module

- [x] 5.1 Create `apps/catalog/src/seat-definitions/seat-definition.entity.ts` — UUID PK, `show_id` FK → Show, `section varchar(50)`, `row varchar(10)`, `number int`, `price numeric(10,2)`, `created_at`; add `@Unique(['showId', 'section', 'row', 'number'])`
- [x] 5.2 Create `apps/catalog/src/seat-definitions/seat-definitions.module.ts` registering the entity and exporting `TypeOrmModule`

## 6. Initial Migration

- [x] 6.1 Run `typeorm migration:generate` to produce the initial migration covering `venues`, `shows` (with enum type), and `seat_definitions` (with unique constraint)
- [x] 6.2 Run `typeorm migration:run` against the Neon dev database and confirm all three tables exist

## 7. Show Status Service

- [x] 7.1 Create `apps/catalog/src/shows/shows.service.ts` with a `transitionStatus(showId, newStatus)` method that enforces `DRAFT → PUBLISHED` and `DRAFT → CANCELLED` as the only valid transitions and throws a domain error otherwise

## 8. Verification

- [x] 8.1 Query the Neon dev database and confirm: `venues`, `shows`, and `seat_definitions` tables exist with the correct columns, the `show_status` enum type is present, and the unique constraint on `seat_definitions(show_id, section, row, number)` is in place

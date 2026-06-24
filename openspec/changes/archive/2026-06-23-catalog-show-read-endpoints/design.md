## Context

The catalog service owns `Venue`, `Show`, and `SeatDefinition` entities via TypeORM. `ShowsService` currently only handles status transitions; there is no controller and no read queries. The change adds read queries to the existing service and introduces a controller — no new modules, no new infrastructure.

## Goals / Non-Goals

**Goals:**
- `GET /shows` returns `PUBLISHED` shows ordered by `date_time` ASC
- `GET /shows/:id` returns a single show or 404
- `GET /shows/:id/seats` returns seat definitions for a show or 404 if the show is missing
- JSON responses shaped with explicit DTOs (no raw entity leak)

**Non-Goals:**
- No pagination, filtering, or sorting parameters in this change
- No authentication or authorization
- No write endpoints
- No Kafka events emitted

## Decisions

### Single controller in ShowsModule, no new module

All three endpoints live in one `ShowsController` registered inside the existing `ShowsModule`. The seat-definitions read is a sub-resource of shows (`/shows/:id/seats`), so it belongs in the same controller rather than a separate `SeatDefinitionsController`.

**Alternatives considered:**
- Separate `SeatDefinitionsController` in `SeatDefinitionsModule`: unnecessary split for a sub-resource URL; adds module complexity with no benefit at this scope.

### SeatDefinitionsService for seat queries

A `SeatDefinitionsService` is created in `SeatDefinitionsModule` and imported into `ShowsModule`. This keeps the repository access for `SeatDefinition` inside its own module boundary while allowing `ShowsController` to delegate to it.

**Alternatives considered:**
- Query `SeatDefinition` directly from `ShowsService`: crosses module boundaries and couples unrelated concerns.

### Response DTOs, no class-transformer

Plain class DTOs with `toJSON`-style mapping in the service methods. No `@Expose()` / `class-transformer` needed; the mapping is explicit and easy to trace.

**Alternatives considered:**
- `class-transformer` with `@Exclude`/`@Expose`: adds a dependency and implicit behaviour that's harder to follow for simple read-only shapes.

## Risks / Trade-offs

- **No pagination on `GET /shows`** → For dev/test with the seeded data (3 shows) this is fine. Will need pagination before production load grows.
- **`SeatDefinition` price is `numeric(10,2)` in Postgres** → TypeORM returns it as a string; the DTO must cast to `number` explicitly to avoid leaking a string in the JSON response.

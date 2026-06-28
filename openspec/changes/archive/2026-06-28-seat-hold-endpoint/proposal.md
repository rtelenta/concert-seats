## Why

The seating service has no way to temporarily reserve seats for a user. Without a hold mechanism, two users can simultaneously reach checkout with the same seats, causing overselling. The seat entity already carries the `heldBy`, `heldUntil`, and `version` columns — the data layer is ready; only the endpoint and business logic are missing.

## What Changes

- Add `POST /shows/:showId/seats/hold` to the seating service
- Request body: `{ seatIds: ["uuid", ...] }` — caller supplies the seats to hold
- User identity read from `X-User-Id` request header (set by upstream gateway or service mesh)
- All-or-nothing semantics: if any requested seat is not `AVAILABLE`, no hold is applied and a `409 Conflict` is returned
- Concurrency safety via a PostgreSQL transaction with `SELECT … FOR UPDATE` row locking plus per-seat version validation in the `UPDATE` WHERE clause
- On success: each seat transitions `status → HELD`, `heldBy → userId`, `heldUntil → now + 5 min`, `version → version + 1`
- Response: the array of updated `SeatResponseDto` objects

## Capabilities

### New Capabilities

- `seat-hold`: All-or-nothing seat hold with transactional concurrency control

### Modified Capabilities

_(none — no existing spec requirements change)_

## Impact

- `apps/seating/src/seats/services/seats.service.ts` — new `holdSeats` method using `DataSource` / `QueryRunner`
- `apps/seating/src/seats/controllers/seats.controller.ts` — new `POST /shows/:showId/seats/hold` route
- `apps/seating/src/seats/dtos/` — new `HoldSeatsDto` for request body validation
- No schema migration required (columns already exist)
- No gateway changes in this change (gateway proxy can be added separately)

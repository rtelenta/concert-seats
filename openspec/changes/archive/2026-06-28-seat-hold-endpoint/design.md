## Context

The `Seat` entity already has the full schema for holds: `status` (AVAILABLE/HELD/SOLD), `heldBy` (nullable string), `heldUntil` (nullable Date), and `version` (TypeORM `@VersionColumn`, auto-incremented integer). The `SeatsService` currently only has `findByShow`; the `SeatsModule` already imports `TypeOrmModule.forFeature([Seat])`. `DataSource` is globally injectable from the root TypeORM config.

## Goals / Non-Goals

**Goals:**
- Atomic all-or-nothing hold for a batch of seat IDs
- Prevent two concurrent requests from holding the same seat
- Validate seat existence, show ownership, and AVAILABLE status before committing

**Non-Goals:**
- Automatic hold expiry / background release (out of scope; `heldUntil` is written but no cron job is added here)
- Gateway proxy route (separate change)
- Hold release endpoint (separate concern)

## Decisions

**`SELECT … FOR UPDATE` + version check in UPDATE WHERE clause**

The transaction flow:
1. `BEGIN`
2. `SELECT seatId, status, version FROM seats WHERE seatId IN (:seatIds) AND showId = :showId FOR UPDATE NOWAIT`
   — acquires exclusive row locks; fails immediately if any row is locked by another transaction (raises `55P03` lock_not_available → caught and re-thrown as `409 Conflict`)
3. Application asserts `seats.length == seatIds.length` (not-found check) and all `status == AVAILABLE`; throws `404` / `409` and rolls back if not
4. `UPDATE seats SET status='HELD', held_by=:userId, held_until=NOW()+INTERVAL '5 minutes', version=version+1 WHERE (seatId=:id0 AND version=:v0 AND status='AVAILABLE') OR (seatId=:id1 AND version=:v1 AND status='AVAILABLE') OR …`
5. Assert `result.affected == seatIds.length`; throw `409` and roll back if not (defensive: covers any gap between the SELECT and UPDATE that `FOR UPDATE` does not fully prevent)
6. `COMMIT`; fetch and return updated seats

*Why `FOR UPDATE` instead of the plain SELECT COUNT + UPDATE the user sketched?*
The simpler approach (SELECT COUNT then UPDATE) is correct at `SERIALIZABLE` isolation, but at PostgreSQL's default `READ COMMITTED` a gap still exists: a concurrent UPDATE on the same row can slip in between the COUNT check and the UPDATE because `READ COMMITTED` re-evaluates `WHERE` on each statement, not on a snapshot held since the transaction started. `FOR UPDATE` closes this gap by holding row-level locks across both statements.

*Why `NOWAIT`?*
Blocking waits under high load can exhaust the connection pool. `NOWAIT` surfaces the contention immediately as a 409 so the client can retry — the correct UX for a seat selection race.

*Why per-seat version conditions instead of just `status='AVAILABLE'`?*
The version check makes the UPDATE idempotent-safe and provides a defence-in-depth layer. If `FOR UPDATE NOWAIT` fails due to a driver or cloud-proxy that strips advisory locks, the version mismatch still causes the affected-count check to fail and triggers a rollback.

**Execution via `QueryRunner`**

TypeORM's `DataSource.createQueryRunner()` gives explicit transaction control. The `holdSeats` method injects `DataSource` (available globally from the root `TypeOrmModule.forRootAsync()`). No changes to `SeatsModule` imports are needed.

**`HoldSeatsDto`**

```ts
class HoldSeatsDto {
  @IsArray()
  @IsUUID('all', { each: true })
  @ArrayMinSize(1)
  seatIds: string[];
}
```

`ValidationPipe` is already global in the seating `main.ts`.

**Response**

Return the updated seats as `SeatResponseDto[]` — same shape as `GET /shows/:showId/seats`, no new DTO needed.

**`X-User-Id` header**

Read via `@Headers('x-user-id')` in the controller. NestJS normalises header names to lowercase. No auth guard is added in this change (the gateway or service mesh is responsible for authentication upstream).

## Risks / Trade-offs

- **`NOWAIT` returns 409 on lock contention** — clients must implement retry with backoff. This is intentional; silent blocking under contention is worse.
- **Hold expiry not enforced by the DB** — `heldUntil` is informational until a separate cleanup job or trigger is added. Seats can remain `HELD` past their expiry until that job runs.
- **Per-seat version WHERE clause grows linearly** — acceptable for typical seat-selection batch sizes (≤ 20 seats). If the batch is huge, a temp-table join or `unnest` would be more efficient; not needed at this scale.

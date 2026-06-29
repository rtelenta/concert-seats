## Context

The gateway already proxies show and seat reads to catalog/seating via `ShowsQueryService`. That service holds `seatingUrl` (read from `SEATING_URL` config), so the new hold call slots into the existing pattern with no new config required.

`ClerkAuthGuard` verifies the Bearer JWT and stores the payload on `request.auth`. The `@CurrentUser()` decorator reads `request.auth` and returns the `ClerkJwtPayload` — `payload.sub` is the Clerk user ID to forward as `x-user-id`.

The seating service endpoint: `POST /shows/:showId/seats/hold` — body `{ seatIds: string[] }`, header `x-user-id`.

## Goals / Non-Goals

**Goals:**
- Authenticated `POST /shows/:id/hold-seats` on the gateway that proxies to seating
- `userId` extracted from verified JWT and forwarded as `x-user-id` header on the Axios call
- Body (`seatIds[]`) passed through unchanged
- 401 returned before any downstream call if the token is missing or invalid

**Non-Goals:**
- No `AsyncLocalStorage` — `userId` is an explicit method parameter, not ambient state
- No changes to the seating service
- No response transformation — return the seating service's response body as-is

## Decisions

### 1. Route shape: `POST /shows/:id/hold-seats`

Matches the resource-centric URL already used by the gateway (`/shows/:id/seats`, `/shows/:id/seat-definitions`). The seating service uses `/seats/hold` internally — the gateway translates.

### 2. Guard at the action level, not globally

`ClerkAuthGuard` is applied with `@UseGuards(ClerkAuthGuard)` on the `holdSeats` action only. This keeps the pattern consistent with how the guard is used elsewhere in the gateway and avoids silently breaking unauthenticated read routes.

### 3. Explicit `userId` parameter on the service method

`ShowsQueryService.holdSeats(showId: string, dto: HoldSeatsDto, userId: string)` receives `userId` directly. This is simpler, more testable, and requires no ambient storage — the value flows top-down from guard → controller → service.

### 4. `x-user-id` set per-call via Axios config, not the global interceptor

The correlation-ID interceptor sets headers globally. `x-user-id` is request-specific user identity and belongs on the individual call: `this.http.post(..., { headers: { 'x-user-id': userId } })`. Keeps the two concerns separate.

### 5. `HoldSeatsDto` defined in gateway dtos, not imported from seating

The gateway owns its request shape. A thin `HoldSeatsDto` with `seatIds: string[]` lives in `apps/concertseats/src/shows/dtos/`. No cross-service DTO sharing.

## Risks / Trade-offs

- **Seating response shape changes** → gateway passes the body through; a breaking change in seating would surface to clients. Acceptable given single-team ownership.
- **`userId` is `payload.sub`** — Clerk's `sub` is the Clerk user ID string. The seating service already trusts whatever `x-user-id` it receives (validated at the gateway boundary), so this is consistent with the existing auth model.

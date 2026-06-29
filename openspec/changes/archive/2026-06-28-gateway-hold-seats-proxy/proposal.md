## Why

The seating service already exposes `POST /shows/:showId/seats/hold`, but it is not reachable through the gateway — clients have no authenticated path to hold seats. Adding a gateway proxy endpoint closes this gap and enforces auth before any seat state is mutated.

## What Changes

- New `POST /shows/:id/hold-seats` endpoint on the gateway, protected by `ClerkAuthGuard`
- `userId` is extracted from the verified JWT payload (`payload.sub`) via `@CurrentUser()` and passed explicitly to the service method
- The service method proxies the call to the seating service, setting the `x-user-id` header on the outgoing Axios request
- `HoldSeatsDto` (request body: `seatIds: string[]`) reused / mirrored in the gateway
- Response shape mirrors `SeatResponseDto[]` already used by the gateway

## Capabilities

### New Capabilities

- `gateway-hold-seats`: Protected gateway endpoint that proxies hold-seat requests to the seating service with authenticated user identity

### Modified Capabilities

_(none)_

## Impact

- **apps/concertseats**: new route on `ShowsController`, new method on `ShowsQueryService`, new `HoldSeatsDto`
- **No changes** to catalog, seating, or shared libs
- **Auth required**: unauthenticated callers receive 401 before any downstream call is made

## Why

The Next.js frontend uses Clerk for authentication and passes JWT tokens to the backend. Without a guard, all NestJS API endpoints are publicly accessible — there is no way to verify that incoming requests come from authenticated Clerk users.

## What Changes

- Add `@clerk/backend` as a dependency for JWT verification
- Create `apps/concertseats/src/auth/` containing a `ClerkAuthGuard` and a `@CurrentUser` decorator
- Apply the guard per-route on the `concertseats` app so that protected endpoints require a valid Clerk session token in the `Authorization: Bearer <token>` header

## Capabilities

### New Capabilities
- `clerk-auth-guard`: NestJS `CanActivate` guard that extracts and verifies the Clerk JWT from the `Authorization` header using `@clerk/backend`, attaches verified claims to the request, and provides a `@CurrentUser` parameter decorator for controllers

### Modified Capabilities
<!-- No existing spec-level requirements are changing -->

## Impact

- **New module**: `apps/concertseats/src/auth/` — scoped to the concertseats gateway app
- **New dependency**: `@clerk/backend` (JWT verification, no HTTP overhead)
- **Environment variable**: `CLERK_SECRET_KEY` must be present in the concertseats runtime config
- **concertseats app**: `AppModule` imports `AuthModule`; controllers annotate protected routes with `@UseGuards(ClerkAuthGuard)`

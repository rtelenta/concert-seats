## Context

The monorepo has three NestJS backend services (catalog, concertseats, seating) and a Next.js frontend that uses Clerk for user authentication. The frontend obtains a Clerk session JWT and must pass it to the backend APIs. Currently no backend service verifies incoming tokens — all routes are unauthenticated.

The guard lives inside `apps/concertseats/src/auth/` — the public-facing gateway is the only service that handles HTTP from external clients, so co-locating the guard there keeps the scope tight.

## Goals / Non-Goals

**Goals:**
- Verify Clerk JWTs on the backend using `@clerk/backend` (offline-capable JWKS caching)
- Implement `ClerkAuthGuard` and `@CurrentUser` decorator inside `apps/concertseats/src/auth/`
- Register the guard in the `concertseats` app (the public-facing gateway)
- Keep `CLERK_SECRET_KEY` as the only required new environment variable

**Non-Goals:**
- Role-based access control (RBAC) — out of scope for this change
- Applying the guard to `catalog` or `seating` internal services — they communicate over Kafka, not HTTP
- Building a custom JWT library; we delegate entirely to `@clerk/backend`

## Decisions

### 1. Per-app guard inside `apps/concertseats` over a shared library

**Decision**: Place the guard in `apps/concertseats/src/auth/` rather than in a shared `libs/auth` library.

**Rationale**: `concertseats` is the sole HTTP gateway for external clients; `catalog` and `seating` communicate over Kafka and do not expose public HTTP. There is no concrete sharing need today, and co-locating the guard with its only consumer keeps the dependency boundary clear.

**Alternative considered**: `libs/auth` shared library — avoids future copy-paste if other apps ever expose HTTP, but adds unnecessary indirection now.

### 2. `@clerk/backend` for JWT verification

**Decision**: Use `@clerk/backend`'s `verifyToken` with automatic JWKS fetching and caching.

**Rationale**: `@clerk/backend` is the official server-side SDK. It handles JWKS rotation, clock skew, and audience validation without requiring a network call on every request after the initial key fetch.

**Alternative considered**: `@clerk/express` middleware — couples the guard to Express and does not fit NestJS's guard pattern cleanly.

### 3. Guard applied per-route via `@UseGuards`, not globally

**Decision**: Decorate individual controllers/handlers with `@UseGuards(ClerkAuthGuard)` rather than registering as a global guard.

**Rationale**: Some endpoints (health checks, Swagger UI) must remain public. Per-route decoration makes the security boundary explicit and visible in the controller code.

**Alternative considered**: Global guard with a `@Public()` skip decorator — common pattern but adds indirection; keep it simple until more routes exist.

### 4. Attach verified payload as `request.auth`

**Decision**: On successful verification, attach the decoded Clerk `JwtPayload` to `request.auth` (not `request.user`) to avoid colliding with Passport conventions.

**Rationale**: The project does not use Passport; using `request.auth` is unambiguous and matches Clerk's own Express middleware naming.

## Risks / Trade-offs

- **JWKS network dependency on cold start** → The first request after startup requires a JWKS fetch. Mitigated by Clerk's CDN and `@clerk/backend`'s in-memory cache.
- **Clock skew** → `verifyToken` accepts a `clockSkewInMs` option; default (0) is fine for server-to-server calls from the same infrastructure.
- **Missing `CLERK_SECRET_KEY`** → Guard throws a 500 at startup if the key is absent. Mitigated by adding a config validation step in `ClerkAuthModule`.

## Migration Plan

1. Add `@clerk/backend` to root `package.json`
2. Create `apps/concertseats/src/auth/` and implement `ClerkAuthGuard`, `@CurrentUser` decorator, and `AuthModule`
3. Import `AuthModule` in `apps/concertseats/src/app.module.ts`
4. Add `@UseGuards(ClerkAuthGuard)` to the first protected controller
5. Update `.env.example` with `CLERK_SECRET_KEY`

Rollback: removing `@UseGuards(ClerkAuthGuard)` from controllers instantly reverts protection with no data migration needed.

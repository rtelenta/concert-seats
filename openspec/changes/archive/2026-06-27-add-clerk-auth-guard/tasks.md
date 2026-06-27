## 1. Dependencies & Scaffold

- [x] 1.1 Add `@clerk/backend` to root `package.json` dependencies and run `pnpm install`
- [x] 1.2 Add `CLERK_SECRET_KEY=` to `.env.example` (or equivalent env template file)

## 2. Auth Module Implementation

- [x] 2.1 Create `apps/concertseats/src/auth/clerk-auth.guard.ts` — implements `CanActivate`, extracts `Authorization: Bearer` header, calls `@clerk/backend` `verifyToken`, throws `UnauthorizedException` on failure
- [x] 2.2 Attach the verified Clerk JWT payload to `request.auth` inside the guard on success
- [x] 2.3 Create `apps/concertseats/src/auth/current-user.decorator.ts` — `@CurrentUser()` parameter decorator that reads `request.auth`
- [x] 2.4 Create `apps/concertseats/src/auth/auth.module.ts` — `AuthModule` that reads `CLERK_SECRET_KEY` from `ConfigService`, throws a descriptive error if absent, and provides `ClerkAuthGuard`
- [x] 2.5 Import `AuthModule` into `apps/concertseats/src/app.module.ts`

## 3. concertseats App Integration

- [x] 3.1 Apply `@UseGuards(ClerkAuthGuard)` to the first protected controller route in the concertseats app
- [x] 3.2 Verify the health check (or any unguarded route) still returns 200 without a token

## 4. Verification

- [x] 4.1 Start the concertseats app locally and confirm a request without a token to a guarded route returns HTTP 401
- [x] 4.2 Confirm a request with a valid Clerk Bearer token to a guarded route returns HTTP 200
- [x] 4.3 Confirm the app fails to start when `CLERK_SECRET_KEY` is missing from the environment

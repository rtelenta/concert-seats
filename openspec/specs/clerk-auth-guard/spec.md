# Spec: Clerk Auth Guard

## Purpose

Defines requirements for a NestJS `ClerkAuthGuard` that validates Clerk-issued JWTs on incoming HTTP requests. The guard verifies Bearer tokens against Clerk's JWKS endpoint, attaches the verified payload to the request, and rejects unauthenticated requests with HTTP 401. Routes without the guard remain publicly accessible. The supporting `ClerkAuthModule` is configured via environment variables at startup.

## Requirements

### Requirement: Valid Clerk JWT grants access
The `ClerkAuthGuard` SHALL extract the `Authorization: Bearer <token>` header from the incoming HTTP request, verify the JWT signature against Clerk's JWKS endpoint, and allow the request to proceed when the token is valid and not expired.

#### Scenario: Request with valid Bearer token is allowed
- **WHEN** a request arrives with `Authorization: Bearer <valid-clerk-jwt>`
- **THEN** the guard returns `true`, the verified JWT payload is attached to `request.auth`, and the handler is invoked

#### Scenario: Verified payload is accessible in controller
- **WHEN** a handler parameter is annotated with `@CurrentUser()`
- **THEN** the parameter receives the verified Clerk JWT payload (including `sub`, `email`, and any custom claims)

### Requirement: Missing or malformed token is rejected
The `ClerkAuthGuard` SHALL throw an `UnauthorizedException` (HTTP 401) when no `Authorization` header is present, the header value is not in `Bearer <token>` format, or the token fails signature verification.

#### Scenario: Request with no Authorization header returns 401
- **WHEN** a request arrives without an `Authorization` header
- **THEN** the guard throws `UnauthorizedException` with message `Unauthorized`

#### Scenario: Request with invalid token returns 401
- **WHEN** a request arrives with `Authorization: Bearer <tampered-or-expired-token>`
- **THEN** the guard throws `UnauthorizedException` with message `Unauthorized`

### Requirement: Public routes bypass the guard
Routes NOT annotated with `@UseGuards(ClerkAuthGuard)` SHALL remain accessible without authentication.

#### Scenario: Health check route is publicly accessible
- **WHEN** a request is made to a controller route that has no `@UseGuards(ClerkAuthGuard)` decorator
- **THEN** the request proceeds without any token validation

### Requirement: Auth module is configurable via environment
The `ClerkAuthModule` SHALL read `CLERK_SECRET_KEY` from the environment at module initialization. If the key is absent, the application SHALL fail to start with a descriptive error.

#### Scenario: Missing CLERK_SECRET_KEY prevents startup
- **WHEN** the application starts without `CLERK_SECRET_KEY` set in the environment
- **THEN** the application throws a configuration error during bootstrap and does not accept requests

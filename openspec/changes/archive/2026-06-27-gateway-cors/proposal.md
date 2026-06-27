## Why

The concertseats gateway has no CORS configuration, so browsers block cross-origin requests from the frontend. The frontend runs on localhost during development and a production domain in deployment, and some routes send a Clerk JWT via the `Authorization` header — which requires explicit CORS support for credentialed requests.

## What Changes

- Enable CORS in the gateway's `main.ts` bootstrap using NestJS's `app.enableCors()`
- Read allowed origins from a `CORS_ORIGINS` environment variable (comma-separated list)
- Allow credentials so that the `Authorization` header is not blocked
- Add `CORS_ORIGINS` to the app config so the value is validated at startup

## Capabilities

### New Capabilities

- `gateway-cors`: CORS policy for the concertseats gateway, covering allowed origins, credentials, and headers

### Modified Capabilities

_(none — this is purely additive infrastructure)_

## Impact

- `apps/concertseats/src/main.ts` — `enableCors()` call added
- `apps/concertseats/src/config/app.config.ts` — `corsOrigins` field added (reads `CORS_ORIGINS`)
- New env var required: `CORS_ORIGINS` (comma-separated, e.g. `http://localhost:5173,https://myapp.com`)
- No changes to downstream catalog or seating services

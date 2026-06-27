## Context

NestJS exposes `app.enableCors(options)` in `main.ts` before `app.listen()`. The current bootstrap has no CORS call. Because some routes require a Clerk JWT in the `Authorization` header, the browser's CORS preflight will block requests unless the server explicitly allows credentials and the `Authorization` header.

Using `credentials: true` in the CORS config means the `origin` option cannot be `'*'` — it must be an explicit list of allowed origins. The frontend needs both a localhost dev URL and a production domain, so origins are read from an environment variable to avoid hardcoding.

## Goals / Non-Goals

**Goals:**
- Unblock cross-origin requests from the frontend for all existing and future routes
- Support `Authorization` header passthrough for authenticated routes
- Keep origins configurable per environment (dev vs. prod) without code changes

**Non-Goals:**
- Per-route CORS policy (all gateway routes share the same policy)
- CORS for catalog or seating services (they are internal; only the gateway is browser-facing)

## Decisions

**Origins from `CORS_ORIGINS` env var, comma-split at startup**
`app.config.ts` parses `CORS_ORIGINS` as `string[]` by splitting on `,`. `main.ts` reads this list and passes it to `enableCors`. If the variable is absent, the app throws at startup (consistent with how `CATALOG_URL` and `SEATING_URL` are handled).
*Alternative*: hardcode origins per `NODE_ENV` — rejected, env vars are already the established pattern in this project.

**Single shared CORS policy for all routes**
`enableCors` is called once in bootstrap, applying to all routes. Routes that don't require auth still work fine with `credentials: true` — it simply means the browser _may_ send credentials, not that it must.
*Alternative*: use a `@nestjs/common` CorsOptions guard per controller — overkill for a gateway this size.

**Allowed methods and headers are explicit**
Methods: `GET, POST, PATCH, PUT, DELETE, OPTIONS`. Headers: `Content-Type, Authorization`. This is the minimal set needed; overly broad wildcards are avoided.

**Preflight handled by NestJS default**
NestJS `enableCors` automatically handles `OPTIONS` preflight requests. No additional `@Options()` controller methods needed.

## Risks / Trade-offs

- **Missing `CORS_ORIGINS` at startup fails loudly** — intentional; a silent empty list would mean all origins are blocked, which is harder to debug than an explicit startup error.
- **`credentials: true` with explicit origins** — correct behavior per the CORS spec; browsers require this pair when sending auth headers cross-origin.

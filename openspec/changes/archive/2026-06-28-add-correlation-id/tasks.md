## 1. Shared storage primitive

- [x] 1.1 Add `CorrelationIdStorage` to `libs/common/src/` — wraps `AsyncLocalStorage<string>` with `run(id, fn)` and `get()` helpers
- [x] 1.2 Export `CorrelationIdStorage` from `libs/common/src/index.ts`

## 2. Gateway middleware

- [x] 2.1 Create `apps/concertseats/src/common/middleware/correlation-id.middleware.ts` — reads `x-correlation-id` header or calls `crypto.randomUUID()`, calls `CorrelationIdStorage.run()`, sets `X-Correlation-Id` on the response
- [x] 2.2 Register the middleware globally in `apps/concertseats/src/app.module.ts` using `configure(consumer)` for all routes (`*`)

## 3. Gateway outbound forwarding

- [x] 3.1 Add an Axios request interceptor to `HttpService` in the gateway — reads `CorrelationIdStorage.get()` and sets `X-Correlation-Id` on every outgoing request header
- [x] 3.2 Wire the interceptor in `apps/concertseats/src/shows/shows.module.ts` (or a shared HTTP module) so it applies to all `HttpService` usage in the gateway

## 4. Catalog middleware

- [x] 4.1 Create `apps/catalog/src/common/middleware/correlation-id.middleware.ts` — reads `x-correlation-id` header and calls `CorrelationIdStorage.run()` if present
- [x] 4.2 Register the middleware globally in `apps/catalog/src/app.module.ts` for all routes

## 5. Seating middleware

- [x] 5.1 Create `apps/seating/src/common/middleware/correlation-id.middleware.ts` — same pattern as catalog
- [x] 5.2 Register the middleware globally in `apps/seating/src/app.module.ts` for all routes

## 6. Verification

- [x] 6.1 Start all services and `curl -H "X-Correlation-Id: test-123" http://localhost:3000/shows` — confirm the response header `X-Correlation-Id: test-123` is returned
- [x] 6.2 `curl http://localhost:3000/shows` (no header) — confirm a UUID is returned in `X-Correlation-Id` response header
- [x] 6.3 Check catalog and seating logs for the same correlation ID appearing alongside the request log lines

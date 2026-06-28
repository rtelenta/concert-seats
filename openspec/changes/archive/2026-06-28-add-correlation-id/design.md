## Context

The gateway (`concertseats`) is the single HTTP entry point. It forwards requests to `catalog` and `seating` via `HttpService` (Axios-based). Currently there is no shared request identifier across these services — a failure in seating cannot be correlated with the gateway log entry that triggered it.

The user-supplied idiom: `const correlationId = request.headers['x-correlation-id'] ?? uuid();` shows the intent — honour an externally supplied ID (from a client, load balancer, or test harness) or mint one at the gateway boundary.

## Goals / Non-Goals

**Goals:**
- Gateway assigns a correlation ID per request (read header or generate UUID v4)
- Gateway forwards the ID as `X-Correlation-Id` on every outgoing `HttpService` call to catalog and seating
- Gateway echoes the ID back to the caller as `X-Correlation-Id` in the response
- Catalog and seating extract the ID from the incoming header and bind it to the async context so it is available for logging throughout the request lifecycle

**Non-Goals:**
- Injecting the correlation ID into Kafka message headers (that uses `correlationId` on `EventEnvelope` already — separate concern)
- Modifying existing OpenTelemetry trace propagation
- Authentication or validation of the supplied ID value

## Decisions

### 1. NestJS Middleware for intake + response header (gateway)

Using a `NestJS` middleware (not an interceptor) for the gateway intake because middleware runs before route guards and controller logic, so the ID is available for the entire request lifecycle including error paths. The middleware:
1. Reads `x-correlation-id` from the incoming request header
2. Falls back to `crypto.randomUUID()` (Node.js built-in, no extra dependency)
3. Stores the ID on `request` (e.g. `req.correlationId`)
4. Sets `X-Correlation-Id` on the response immediately

**Alternative considered:** A global interceptor. Rejected because interceptors run after guards, meaning failed auth requests would have no correlation ID attached to the response.

### 2. Axios request interceptor via `HttpService` for forwarding (gateway)

The gateway's query services (`shows-query.service.ts`, `venues-query.service.ts`) use `HttpService` (Axios). To forward the correlation ID without touching each call site, we add an Axios request interceptor on the `HttpService` instance. The interceptor reads the current correlation ID from `AsyncLocalStorage` and injects it into outgoing request headers.

**Alternative considered:** Passing the ID explicitly through every service method signature. Rejected — it pollutes every method call with infrastructure concerns and would require changes to all future query services.

### 3. AsyncLocalStorage for propagation within a request

Node's `AsyncLocalStorage` provides request-scoped storage without threading the ID through function parameters. A `CorrelationIdStorage` singleton wraps it. Middleware populates it; the Axios interceptor reads from it.

**Alternative considered:** Storing the ID on the request object and injecting `REQUEST` scope into services. Rejected — `REQUEST`-scoped providers propagate through the DI tree and create significant overhead and complexity.

### 4. Shared library (`libs/common`) for the storage primitive

The `AsyncLocalStorage` wrapper lives in `libs/common` so catalog and seating can import the same primitive to read (not write) the correlation ID from their own middleware. Avoids duplicating the pattern in each service.

### 5. Catalog and seating: middleware only (no forwarding)

Catalog and seating are leaf services — they receive the header, bind it to `AsyncLocalStorage`, and optionally attach it to log context. They do not need to forward it further. A single lightweight middleware per service achieves this.

## Risks / Trade-offs

- **AsyncLocalStorage loses context across `setImmediate`/`process.nextTick` boundaries** → Avoid scheduling work outside the async chain; current service patterns don't do this.
- **ID is not validated** → A caller can supply any string as the correlation ID. This is intentional (pass-through semantics) but means log searches must tolerate arbitrary values. Consider a max-length guard if needed later.
- **Axios interceptor is global on the HttpService instance** → If a future service uses `HttpService` for external third-party calls, the header will be forwarded there too. Acceptable for now; add per-call opt-out if needed.

## Migration Plan

1. Add `CorrelationIdStorage` to `libs/common`
2. Add gateway middleware (`CorrelationIdMiddleware`) — no breaking changes, purely additive
3. Add Axios interceptor in the gateway's `HttpModule` setup
4. Add lightweight middleware to catalog and seating
5. Deploy in any order — header is optional on all downstream services, no coordination required
6. Rollback: remove middleware registrations; no data migrations involved

## Context

`concertseats` is the public HTTP gateway (Backends-for-Frontends). The catalog service owns show and seat-definition data; the seating service owns live seat inventory. The gateway proxies four read endpoints to these services and returns their responses transparently. No Kafka events are involved — this is a pure HTTP read path.

**Pattern**: HTTP Gateway (BFF). No Saga, no Outbox, no Kafka.

**Layers touched**:
- `concertseats`: controller + query-service (new `shows` module)
- `catalog`: no changes
- `seating`: no changes

## Goals / Non-Goals

**Goals:**
- Proxy `GET /shows`, `GET /shows/:id`, `GET /shows/:id/seat-definitions` → catalog
- Proxy `GET /shows/:id/seats` → seating
- Configure downstream base URLs via `CATALOG_URL` and `SEATING_URL` env vars
- Pass through HTTP status codes (404s, 5xxs) transparently

**Non-Goals:**
- Response transformation or schema translation
- Authentication enforcement on these routes (can be layered via `ClerkAuthGuard` later)
- Write operations — read-only proxy for now
- Caching or circuit breakers — out of scope

## Decisions

### 1. `@nestjs/axios` HttpModule for outbound HTTP

**Decision**: Use `HttpModule` from `@nestjs/axios` in the `ShowsModule`.

**Rationale**: Integrates with NestJS DI; `HttpService` is injectable and mockable in tests. Project already uses NestJS conventions everywhere.

**Alternative considered**: Native `fetch` — bypasses DI, harder to test.

### 2. `shows-query.service.ts` holds all proxy calls

**Decision**: Proxy logic lives in `shows/services/shows-query.service.ts`. No write service needed (no mutations).

**Rationale**: Follows the layer rule: controller → query-service. Keeps controller thin.

### 3. Full base URLs via env vars (not port-derived)

**Decision**: `CATALOG_URL` and `SEATING_URL` as full base URLs.

**Rationale**: In production (Docker/k8s) services are addressed by hostname, not localhost+port. Full URLs are explicit and portable.

## Sequence Diagram

```
Client
  │
  │  GET /shows/:id/seats
  ▼
ShowsController (concertseats)
  │
  │  showsQueryService.getSeats(id)
  ▼
ShowsQueryService
  │
  │  GET {SEATING_URL}/shows/:id/seats
  ▼
SeatsController (seating)
  │
  └── returns Seat[]
  ▼
ShowsQueryService → ShowsController → Client

(Same pattern for catalog routes — replace SEATING_URL with CATALOG_URL)
```

## Module Folder Scaffold

```
apps/concertseats/src/shows/
  shows.module.ts
  controllers/
    shows.controller.ts
  services/
    shows-query.service.ts
  dtos/
    show-response.dto.ts
    seat-definition-response.dto.ts
    seat-response.dto.ts
  exceptions/
    (empty — downstream errors pass through as-is for now)
```

## Risks / Trade-offs

- **[Downstream outage]** → Gateway propagates the error status. No circuit breaker at this stage — acceptable.
- **[Missing env vars]** → `ConfigService.getOrThrow` used in the query service; throws at request time if absent. Mitigated by adding startup validation.
- **[Error shape mismatch]** → NestJS exception bodies from downstream pass through as-is. Frontend must handle them.

## Migration Plan

1. Add `@nestjs/axios` and `axios` to `package.json`; install
2. Scaffold and implement `shows` module in concertseats
3. Import `ShowsModule` in `AppModule`
4. Add `CATALOG_URL` / `SEATING_URL` to `.env.example` and `.env`
5. Smoke-test each route locally

Rollback: remove `ShowsModule` from `AppModule` imports — no data impact.

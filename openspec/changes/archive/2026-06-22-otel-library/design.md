## Context

Currently every NestJS service in the monorepo would need to independently initialise the OpenTelemetry Node.js SDK, configure an OTLP exporter, register NestJS-specific instrumentation, and handle Kafka header propagation. There is no shared abstraction — duplication is guaranteed and consistency cannot be enforced.

`libs/telemetry` (`@concertseats/telemetry`) introduces a single, opinionated NestJS library module that all services can import to get full distributed tracing with zero per-service boilerplate.

## Goals / Non-Goals

**Goals:**
- Single `TelemetryModule.forRoot(options)` call wires up the full OpenTelemetry SDK per service.
- `TraceService` injectable for manual span creation in any NestJS provider.
- `KafkaPropagator` helpers to inject/extract W3C `traceparent` into/from `EventEnvelope.headers`.
- HTTP auto-instrumentation (incoming and outgoing requests).
- NestJS auto-instrumentation (controller spans).
- OTLP/gRPC export to Jaeger (configured via env or options).

**Non-Goals:**
- Metrics or logs pipelines (traces only for now).
- Custom dashboards or alerting rules.
- Modifying `libs/contracts` or `EventEnvelope` shape.
- Per-service manual SDK bootstrap (the library owns it entirely).

## Decisions

### 1. SDK bootstrap happens in `TelemetryModule.forRoot` — not in `main.ts`

**Chosen**: The `NodeSDK` is started inside the module's `onApplicationBootstrap` lifecycle hook.

**Rationale**: Placing SDK init in `main.ts` before `NestFactory.create` is the standard OpenTelemetry recommendation, but requires each service to copy-paste the same setup. Using `onApplicationBootstrap` is slightly later in the lifecycle (after dependency injection) but is sufficient for our span coverage because we only capture spans for controller calls and downstream HTTP/Kafka — none of which happen during bootstrap.

**Alternative considered**: A global `instrumentation.ts` file that services import as a side effect at the top of `main.ts`. Rejected because it still requires per-service wiring and leaks implementation details outside the library boundary.

### 2. OTLP/gRPC exporter targeting Jaeger

**Chosen**: `@opentelemetry/exporter-trace-otlp-grpc` pointing at `OTEL_EXPORTER_OTLP_ENDPOINT` (default `http://localhost:4317`).

**Rationale**: Docker Compose already runs Jaeger with the OTLP collector port exposed. Using the environment variable means no code change is needed between local dev and production — only the env var differs.

**Alternative considered**: Zipkin exporter. Rejected — Jaeger already supports OTLP natively; a second exporter protocol adds a dependency for no gain.

### 3. W3C TraceContext propagation over Kafka headers

**Chosen**: `KafkaPropagator` wraps `@opentelemetry/api`'s `propagation.inject/extract` using a plain `Record<string, string>` carrier that maps to the `EventEnvelope.headers` field.

**Rationale**: The existing `EventEnvelope` already has a `headers` field. W3C `traceparent` / `tracestate` are single string headers — they fit the existing map without any schema changes.

**Alternative considered**: B3 multi-header propagation. Rejected — W3C TraceContext is the OTel default and Jaeger supports it natively.

### 4. Library lives in `libs/telemetry` (NestJS monorepo library)

**Chosen**: Scaffolded via `nest g library telemetry` so it gets a proper `tsconfig` path alias (`@concertseats/telemetry`) and is built as part of the monorepo.

**Rationale**: Consistent with how `libs/contracts` and `libs/kafka` are structured. No separate package publish needed.

## Risks / Trade-offs

- **`onApplicationBootstrap` timing** — Auto-instrumentation patches for `http` and `nestjs-core` need to be registered before any import of those modules. The NestJS module system imports dependencies before calling lifecycle hooks, which means patches may arrive too late for `http`. Mitigation: export a `bootstrapTelemetry()` helper that services call at the very top of `main.ts` (one line, no config duplication).
- **gRPC dependency** — `@opentelemetry/exporter-trace-otlp-grpc` pulls in `@grpc/grpc-js`. This increases bundle size and native build complexity. Mitigation: accepted; Jaeger's OTLP/HTTP endpoint is an alternative if this becomes problematic.
- **No batching config exposed** — The `BatchSpanProcessor` defaults are used. Under very high traffic, the queue may drop spans. Mitigation: defaults are adequate for current scale; options can be added later.

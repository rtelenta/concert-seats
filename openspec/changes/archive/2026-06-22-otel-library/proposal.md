## Why

Services in this monorepo each need OpenTelemetry instrumentation (traces, metrics, logs), but there is no shared setup — every app would have to initialise the SDK, configure exporters, and wire NestJS interceptors independently. A shared library eliminates that duplication and enforces a consistent observability baseline across all services.

## What Changes

- Introduce `libs/telemetry` (`@concertseats/telemetry`) — a NestJS library module that bootstraps the OpenTelemetry Node.js SDK and exposes helper utilities.
- The library configures: OTLP/gRPC trace exporter (Jaeger), resource attributes (service name, version, environment), and W3C `traceparent` propagation.
- Provides a `TelemetryModule.forRoot(options)` dynamic module for service-level registration and a `TraceService` injectable for manual span creation.
- Provides a `KafkaPropagator` helper to inject/extract trace context into/from Kafka message headers (replacing any ad-hoc header handling in services).
- **No breaking changes** — existing services continue to work unchanged; adoption is opt-in per service.

## Capabilities

### New Capabilities
- `telemetry-core`: NestJS dynamic module that initialises the OpenTelemetry SDK (tracer provider, OTLP exporter, resource) and exposes `TraceService` for manual instrumentation.
- `kafka-trace-propagation`: Utilities to inject and extract W3C trace context from Kafka `EventEnvelope` headers, enabling end-to-end distributed tracing across service boundaries.

### Modified Capabilities
<!-- No existing spec-level requirements are changing. -->

## Impact

- **New library**: `libs/telemetry` — no existing code changed.
- **Dependencies added** (to `libs/telemetry`): `@opentelemetry/sdk-node`, `@opentelemetry/api`, `@opentelemetry/exporter-trace-otlp-grpc`, `@opentelemetry/instrumentation-http`, `@opentelemetry/instrumentation-nestjs-core`.
- Services that adopt it add `TelemetryModule.forRoot(...)` to their root module and call the SDK bootstrap before `NestFactory.create`.
- `libs/contracts` `EventEnvelope` type is **not** modified; the propagator reads/writes the existing `headers` map.
- Docker Compose already runs Jaeger; no infrastructure changes required.

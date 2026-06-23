# Spec: telemetry-core

## Overview

`telemetry-core` is a NestJS dynamic library module (`@concertseats/telemetry`) that initialises the OpenTelemetry Node.js SDK and makes distributed tracing available to any service in the monorepo through a single import.

## Requirements

### Module registration

- `TelemetryModule.forRoot(options: TelemetryOptions)` is a global dynamic module (does not need to be re-imported in child modules).
- `TelemetryOptions`:
  - `serviceName: string` — required; sets the `service.name` OTel resource attribute.
  - `serviceVersion?: string` — optional; defaults to `process.env.npm_package_version`.
  - `environment?: string` — optional; defaults to `process.env.NODE_ENV`.
  - `endpoint?: string` — optional OTLP/gRPC endpoint; defaults to `process.env.OTEL_EXPORTER_OTLP_ENDPOINT` or `http://localhost:4317`.
  - `enabled?: boolean` — optional; defaults to `true`. Set to `false` to disable tracing (e.g. in unit tests).

### SDK bootstrap

- The library exports a `bootstrapTelemetry(options: TelemetryOptions): NodeSDK` function that services call at the top of `main.ts` before `NestFactory.create`.
- `bootstrapTelemetry` configures and starts the `NodeSDK` with:
  - `OTLPTraceExporter` (gRPC) pointing at the resolved endpoint.
  - `BatchSpanProcessor` wrapping the exporter.
  - `Resource` with `service.name`, `service.version`, `deployment.environment`.
  - `HttpInstrumentation` and `NestInstrumentation` registered.
  - `W3CTraceContextPropagator` as the global propagator.

### TraceService

- `TraceService` is an injectable NestJS provider exported by `TelemetryModule`.
- API:
  - `startSpan(name: string, options?: SpanOptions): Span` — starts and returns an active span in the current context.
  - `withSpan<T>(name: string, fn: (span: Span) => Promise<T>, options?: SpanOptions): Promise<T>` — runs `fn` inside a new span, ends the span when `fn` resolves or rejects (records exception on error).
  - `currentSpan(): Span` — returns the currently active span (may be `NOOP_SPAN` if none is active).

### Behaviour

- When `enabled: false`, `bootstrapTelemetry` is a no-op and `TraceService` methods return the `NOOP_SPAN` / resolve the function normally — callers do not need to guard against disabled mode.
- On graceful shutdown (`onApplicationShutdown`), the SDK is flushed and shut down so in-flight spans are not lost.
- All spans set `error: true` and record the exception when an unhandled error propagates through `withSpan`.

## Out of Scope

- Metrics pipeline (counters, histograms).
- Log correlation (MDC / trace-id injection into logger).
- Custom sampler configuration (defaults to `AlwaysOn`; can be overridden via `OTEL_TRACES_SAMPLER` env var).

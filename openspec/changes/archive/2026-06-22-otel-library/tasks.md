## 1. Scaffold Library

- [x] 1.1 Run `nest g library telemetry` to scaffold `libs/telemetry` with the `@concertseats/telemetry` path alias
- [x] 1.2 Add OpenTelemetry dependencies to `libs/telemetry/package.json`: `@opentelemetry/sdk-node`, `@opentelemetry/api`, `@opentelemetry/exporter-trace-otlp-grpc`, `@opentelemetry/instrumentation-http`, `@opentelemetry/instrumentation-nestjs-core`

## 2. Bootstrap Function

- [x] 2.1 Create `libs/telemetry/src/bootstrap.ts` — export `bootstrapTelemetry(options: TelemetryOptions): NodeSDK` that builds the SDK with `OTLPTraceExporter`, `BatchSpanProcessor`, resource attributes, and `HttpInstrumentation` + `NestInstrumentation`
- [x] 2.2 Define and export `TelemetryOptions` interface in `libs/telemetry/src/telemetry.options.ts`

## 3. TelemetryModule

- [x] 3.1 Implement `TelemetryModule.forRoot(options)` as a global dynamic module in `libs/telemetry/src/telemetry.module.ts` — stores options in a provider token
- [x] 3.2 Implement `onApplicationShutdown` in `TelemetryModule` to flush and stop the SDK

## 4. TraceService

- [x] 4.1 Implement `TraceService` in `libs/telemetry/src/trace.service.ts` with `startSpan`, `withSpan`, and `currentSpan` methods as specified

## 5. KafkaPropagator

- [x] 5.1 Implement `KafkaPropagator` static class in `libs/telemetry/src/kafka-propagator.ts` with `inject(headers)` and `extract(headers)` using `@opentelemetry/api` `propagation` API

## 6. Barrel Exports

- [x] 6.1 Update `libs/telemetry/src/index.ts` to export `TelemetryModule`, `TelemetryOptions`, `TraceService`, `KafkaPropagator`, and `bootstrapTelemetry`

## 7. Verification

- [x] 7.1 Import `TelemetryModule.forRoot({ serviceName: 'test-svc', enabled: false })` in any existing app's root module and confirm it compiles (`pnpm build`)
- [x] 7.2 Enable tracing in one app (`enabled: true`), run Docker Compose, trigger an HTTP request, and confirm a trace appears in Jaeger UI at `http://localhost:16686`

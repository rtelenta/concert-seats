# Spec: kafka-trace-propagation

## Overview

`kafka-trace-propagation` provides utilities to propagate W3C trace context (`traceparent` / `tracestate`) through Kafka `EventEnvelope` message headers, enabling end-to-end distributed tracing across service boundaries without modifying the `EventEnvelope` contract.

## Requirements

### KafkaPropagator

`KafkaPropagator` is a plain (non-injectable) helper exported from `@concertseats/telemetry`.

#### `KafkaPropagator.inject(headers: Record<string, string>): Record<string, string>`

- Injects the active span context from the current OpenTelemetry context into `headers` using the W3C TraceContext propagator.
- Returns the mutated `headers` object (same reference).
- If no active span exists, `headers` is returned unchanged.
- Usage: called by Kafka producers before publishing, passing `envelope.headers`.

#### `KafkaPropagator.extract(headers: Record<string, string>): Context`

- Extracts trace context from `headers` and returns an OTel `Context` that can be used to start child spans.
- If no valid `traceparent` header is found, returns the root context.
- Usage: called by Kafka consumers at the start of message processing.

### Integration contract

- `EventEnvelope.headers` is typed as `Record<string, string>` in `libs/contracts`. The propagator uses this field directly — no new fields are added to `EventEnvelope`.
- The propagator does not depend on `libs/contracts` to avoid circular dependency; it accepts plain `Record<string, string>`.

### Usage pattern

**Producer (publish side):**
```typescript
const headers = KafkaPropagator.inject({ ...envelope.headers });
await producer.send({ topic, messages: [{ key, value, headers }] });
```

**Consumer (receive side):**
```typescript
const ctx = KafkaPropagator.extract(message.headers as Record<string, string>);
await context.with(ctx, async () => {
  await traceService.withSpan('process-event', async (span) => {
    // handler logic
  });
});
```

### Behaviour

- The propagator is stateless; all methods are static.
- Relies on the global OTel propagator registered by `bootstrapTelemetry` — must be called after SDK bootstrap.
- No exceptions are thrown if OTel is not initialised; `inject` is a no-op and `extract` returns root context.

## Out of Scope

- Automatic consumer middleware that wraps all handlers (each consumer applies the propagator explicitly for full control).
- Baggage propagation (trace context only).

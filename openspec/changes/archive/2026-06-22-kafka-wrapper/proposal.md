## Why

`libs/kafka` is an empty scaffold — services have no mechanism to produce or consume Kafka messages. Without a concrete KafkaJS-backed module, no service can participate in the event-driven architecture defined by `libs/contracts`.

## What Changes

- Implement `KafkaService` in `libs/kafka` as a full KafkaJS wrapper that handles producer lifecycle, consumer group management, and the consume loop.
- `KafkaModule` becomes dynamically configurable (`forRoot` / `forRootAsync`) so services supply broker, clientId, and consumer group via their config.
- Producers wrap `EventEnvelope` serialisation and set the Kafka message key (caller-supplied) plus W3C trace headers via `KafkaPropagator` from `libs/telemetry`.
- Consumers run an idempotent consume loop: deserialise, validate with the Zod schema from `libs/contracts`, deduplicate by `eventId`, dead-letter invalid messages, and emit to a handler callback.
- `KafkaAdminService` exposes topic-creation helpers used during service bootstrap.

## Capabilities

### New Capabilities

- `kafka-module`: NestJS dynamic module (`KafkaModule.forRoot` / `forRootAsync`) that wires KafkaJS producer, consumer, and admin clients as injectable NestJS providers.
- `kafka-producer`: `KafkaProducer` service — publishes `EventEnvelope` messages with caller-supplied partition key and W3C trace context injected into headers.
- `kafka-consumer`: `KafkaConsumer` service — manages consumer group subscription, idempotent processing loop, Zod validation at the boundary, and dead-letter routing for invalid messages.

### Modified Capabilities

<!-- No existing spec-level behavior changes. -->

## Impact

- `libs/kafka` — primary implementation target.
- `libs/contracts` — `EventEnvelope` type and per-event Zod schemas consumed here (no changes to contracts, only imports).
- `libs/telemetry` — `KafkaPropagator` used for trace header injection/extraction (no changes to telemetry).
- All NestJS services that need to produce or consume Kafka messages will import `KafkaModule`.
- Patterns practiced: **Idempotent Consumer** (eventId deduplication), **Dead-Letter Queue** (invalid message routing).

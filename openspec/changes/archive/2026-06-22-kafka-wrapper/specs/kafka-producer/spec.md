## ADDED Requirements

### Requirement: KafkaProducer publishes EventEnvelope messages with a caller-supplied partition key
`KafkaProducer` SHALL expose a `publish<T>(topic: string, key: string, envelope: EventEnvelope<T>): Promise<void>` method that serialises the envelope as JSON and sends it to the specified topic with the given key.

The partition key is caller-supplied. Callers MUST use `showId` as the key for seat and show domain events so that all events for a given show are ordered within one partition.

#### Scenario: Successful publish
- **WHEN** a service calls `kafkaProducer.publish('seat-events', showId, envelope)`
- **THEN** the KafkaJS producer sends a message to the `seat-events` topic with `key = showId` and `value = JSON.stringify(envelope)`

#### Scenario: Broker unavailable during publish
- **WHEN** `publish` is called and all brokers are unreachable
- **THEN** `publish` throws an error that the caller can catch and handle (e.g. retry or emit a compensation event)

### Requirement: KafkaProducer injects W3C trace context into message headers
Before sending, `KafkaProducer` SHALL call `KafkaPropagator.inject(headers, activeSpan)` to add `traceparent` and (if present) `tracestate` headers to every message so distributed traces span producer and consumer.

#### Scenario: Active span present
- **WHEN** `publish` is called within an active OpenTelemetry span
- **THEN** the outgoing Kafka message headers include `traceparent` and (if applicable) `tracestate` values derived from the active span context

#### Scenario: No active span
- **WHEN** `publish` is called with no active OpenTelemetry span
- **THEN** the message is still sent; no `traceparent` header is added and no error is thrown

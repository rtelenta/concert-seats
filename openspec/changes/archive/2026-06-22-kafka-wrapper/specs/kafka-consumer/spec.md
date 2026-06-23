## ADDED Requirements

### Requirement: KafkaConsumer subscribes to topics and dispatches valid messages to a handler
`KafkaConsumer` SHALL expose a `subscribe(options: SubscribeOptions): Promise<void>` method that joins the configured consumer group, subscribes to the specified topics, and invokes `handler` for each valid, non-duplicate message.

```ts
interface SubscribeOptions {
  topics: string[];
  handler: (envelope: EventEnvelope<unknown>, ctx: Context) => Promise<void>;
  isProcessed: (eventId: string) => Promise<boolean>;
  markProcessed: (eventId: string) => Promise<void>;
  schemaResolver?: (eventType: string) => ZodSchema | undefined;
}
```

#### Scenario: Valid message dispatched to handler
- **WHEN** a message arrives on a subscribed topic with a well-formed `EventEnvelope` JSON value
- **THEN** `handler` is called with the deserialised envelope and the extracted trace context, and the offset is committed after `handler` resolves

### Requirement: KafkaConsumer validates incoming messages at the boundary
For each incoming message, `KafkaConsumer` SHALL attempt to deserialise the raw bytes as JSON and, if a `schemaResolver` is provided, validate the result against the Zod schema returned for `envelope.eventType`.

Invalid messages (JSON parse failure or Zod validation error) SHALL be forwarded to `<topic>.dlq` and MUST NOT cause the consumer to crash or stop processing subsequent messages.

#### Scenario: JSON parse failure
- **WHEN** a message value is not valid JSON
- **THEN** the message is forwarded to `<original-topic>.dlq`, the offset is committed, and the consumer continues processing the next message

#### Scenario: Zod validation failure
- **WHEN** the message JSON does not match the schema returned by `schemaResolver(eventType)`
- **THEN** the message is forwarded to `<original-topic>.dlq`, the offset is committed, and the consumer continues processing the next message

#### Scenario: No schema resolver provided
- **WHEN** `subscribe` is called without a `schemaResolver`
- **THEN** Zod validation is skipped and all structurally valid `EventEnvelope` messages are dispatched to `handler`

### Requirement: KafkaConsumer deduplicates messages by eventId
Before dispatching to `handler`, `KafkaConsumer` SHALL call `isProcessed(envelope.eventId)`. If `true`, the message SHALL be skipped (offset committed, handler not called). After `handler` resolves successfully, `KafkaConsumer` SHALL call `markProcessed(envelope.eventId)`.

The deduplication storage (e.g. a processed-events table) is owned by the consuming service; `KafkaConsumer` only invokes the provided callbacks.

#### Scenario: Duplicate message received
- **WHEN** a message with an `eventId` that has already been processed arrives (at-least-once delivery)
- **THEN** `handler` is NOT called, the offset is committed, and the consumer continues with the next message

#### Scenario: First delivery of a message
- **WHEN** a message with a previously unseen `eventId` arrives
- **THEN** `handler` is called, and on successful return `markProcessed` is called with the `eventId`

### Requirement: KafkaConsumer extracts W3C trace context from message headers
Before dispatching, `KafkaConsumer` SHALL call `KafkaPropagator.extract(message.headers)` to reconstruct the trace context, and invoke `handler` within that context so spans created inside the handler are children of the producer span.

#### Scenario: Message with traceparent header
- **WHEN** a message arrives with a `traceparent` header
- **THEN** the handler is invoked with a `Context` that has the extracted span context as the active remote parent

#### Scenario: Message without traceparent header
- **WHEN** a message arrives without a `traceparent` header
- **THEN** the handler is invoked with a root (no-parent) trace context and no error is thrown

### Requirement: KafkaConsumer commits offsets only after successful handler execution
`KafkaConsumer` SHALL commit the offset for a message only after `handler` has resolved (or after the message has been forwarded to the DLQ in the invalid-message case). Offsets MUST NOT be committed before processing is complete.

#### Scenario: Handler throws
- **WHEN** `handler` throws an error for a valid, non-duplicate message
- **THEN** the offset is NOT committed so the message will be redelivered on the next poll, and the error is logged

## 1. Dependencies & Types

- [x] 1.1 Add `kafkajs` to `libs/kafka` in `package.json` and install with pnpm
- [x] 1.2 Define `KafkaModuleOptions` interface and `MessageHandler` / `SubscribeOptions` types in `libs/kafka/src/kafka.types.ts`

## 2. KafkaModule

- [x] 2.1 Implement `KafkaModule.forRoot` and `forRootAsync` factory methods in `kafka.module.ts`, creating a global-scoped dynamic module that provides the KafkaJS `Kafka` instance
- [x] 2.2 Wire `OnApplicationBootstrap` to connect the producer and `OnApplicationShutdown` to disconnect producer, consumer, and admin clients

## 3. KafkaProducer

- [x] 3.1 Implement happy-path `publish(topic, key, envelope)` in `KafkaProducer` — JSON serialise and send via KafkaJS producer
- [x] 3.2 Inject W3C trace headers using `KafkaPropagator.inject` before each send

## 4. KafkaConsumer

- [x] 4.1 Implement happy-path `subscribe(options)` in `KafkaConsumer` — join group, run EachMessage loop, deserialise, call handler, commit offset
- [x] 4.2 Extract W3C trace context via `KafkaPropagator.extract` and invoke handler within that context
- [x] 4.3 Add Zod validation: call `schemaResolver(eventType)` and forward invalid messages to `<topic>.dlq` without crashing
- [x] 4.4 Add eventId deduplication: call `isProcessed` before dispatch and `markProcessed` after successful handler return

## 5. KafkaAdminService

- [x] 5.1 Implement `ensureTopics(topics)` in `KafkaAdminService` using the KafkaJS admin client to create missing topics idempotently

## 6. Exports & Verification

- [x] 6.1 Export `KafkaModule`, `KafkaProducer`, `KafkaConsumer`, `KafkaAdminService`, and all types from `libs/kafka/src/index.ts`
- [x] 6.2 Write a unit test for `KafkaProducer.publish` that asserts the correct key, serialised value, and `traceparent` header are sent
- [x] 6.3 Write a unit test for `KafkaConsumer` that asserts: valid message calls handler; invalid JSON routes to DLQ; duplicate eventId skips handler
- [x] 6.4 Verify end-to-end: import `KafkaModule` in a test app, publish one `EventEnvelope`, and confirm the message appears in Redpanda Console at `localhost:8080`

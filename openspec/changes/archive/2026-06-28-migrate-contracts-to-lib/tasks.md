## 1. Restructure libs/contracts/src/

- [x] 1.1 Create `libs/contracts/src/envelope.ts` with two-param `EventEnvelope<TType extends string = string, TPayload = unknown>` (causationId optional)
- [x] 1.2 Create `libs/contracts/src/topics.ts` with `TOPICS` constant and `Topic` type
- [x] 1.3 Create `libs/contracts/src/event-types.ts` with `EVENT_TYPES`, `COMMAND_TYPES` constants and derived union types
- [x] 1.4 Create `libs/contracts/src/events/catalog.events.ts` with `ShowPublished`, `ShowPublishedPayload`, `ShowPublishedSeat`, `SHOW_PUBLISHED`, `SHOW_EVENTS_TOPIC`
- [x] 1.5 Create `libs/contracts/src/events/seating.events.ts` with all seating event types and payloads
- [x] 1.6 Create `libs/contracts/src/events/booking.events.ts` with all booking event types and payloads
- [x] 1.7 Create `libs/contracts/src/events/payment.events.ts` with all payment event types and payloads
- [x] 1.8 Create `libs/contracts/src/commands/index.ts` with all command types and payloads
- [x] 1.9 Update `libs/contracts/src/index.ts` to re-export all new files plus `DomainEvent` and `Command` union types

## 2. Remove boilerplate

- [x] 2.1 Delete `libs/contracts/src/contracts.module.ts`
- [x] 2.2 Delete `libs/contracts/src/contracts.service.ts`
- [x] 2.3 Delete `libs/contracts/src/contracts.service.spec.ts`
- [x] 2.4 Delete `libs/contracts/src/events/show-published.event.ts` (content moved to catalog.events.ts)

## 3. Update libs/kafka usages

- [x] 3.1 Update `libs/kafka/src/kafka.types.ts`: change `EventEnvelope<unknown>` to `EventEnvelope<string, unknown>`
- [x] 3.2 Update `libs/kafka/src/kafka-consumer.service.ts`: change `EventEnvelope<unknown>` to `EventEnvelope<string, unknown>`
- [x] 3.3 Update `libs/kafka/src/kafka-producer.service.ts`: change `EventEnvelope<T>` to `EventEnvelope<string, T>` and update method signatures
- [x] 3.4 Update `libs/kafka/src/kafka-consumer.service.spec.ts` if it contains `EventEnvelope` usages
- [x] 3.5 Update `libs/kafka/src/kafka-producer.service.spec.ts` if it contains `EventEnvelope` usages

## 4. Verify

- [x] 4.1 Run `pnpm tsc --noEmit` from monorepo root and confirm zero type errors

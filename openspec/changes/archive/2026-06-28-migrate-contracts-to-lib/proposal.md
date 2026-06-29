## Why

The root `contracts/` package (`@concertseats/contracts`) is an external NPM-style package that duplicates event/command type definitions already partially present in `libs/contracts` (`@app/contracts`). The root package will be deleted, so all type definitions must be consolidated into `libs/contracts` as the single source of truth — without zod schemas (runtime validation stays in the kafka lib or consumers).

## What Changes

- Restructure `libs/contracts/src/` to mirror the root `contracts/src/` organization: `events/`, `commands/`, `envelope.ts`, `topics.ts`, `event-types.ts`
- Migrate all event payload interfaces and envelope types from root contracts into `libs/contracts`:
  - `catalog.events.ts` (ShowPublished)
  - `seating.events.ts` (SeatHeld, SeatHoldFailed, SeatHoldExpired, SeatReleased, SeatSold)
  - `booking.events.ts` (BookingStarted, BookingConfirmed, BookingCancelled)
  - `payment.events.ts` (PaymentSucceeded, PaymentFailed)
- Migrate all command types from root contracts: `commands/index.ts` (HoldSeats, ReleaseSeats, ConfirmSeats, ProcessPayment)
- Migrate `TOPICS`, `EVENT_TYPES`, `COMMAND_TYPES`, `DomainEvent`, and `Command` union types
- **BREAKING** (lib-internal): Update `EventEnvelope` generic signature from `<T = unknown>` to `<TType extends string = string, TPayload = unknown>` to support typed discriminated unions; update all existing usages in `libs/kafka` and `apps/` accordingly
- Keep `SHOW_EVENTS_TOPIC` and `SHOW_PUBLISHED` constants as named exports for backward compatibility with existing consumers
- Remove `ContractsModule` and `ContractsService` (empty NestJS boilerplate, not needed for a types-only lib)
- Do NOT migrate zod schemas

## Capabilities

### New Capabilities
- `contracts-lib`: Unified type library (`@app/contracts`) containing all event types, command types, envelope, topics, and event-type constants

### Modified Capabilities
<!-- No existing spec-level requirement changes -->

## Impact

- `libs/contracts/src/` — restructured and expanded
- `libs/kafka/src/kafka.types.ts` — update `EventEnvelope<unknown>` usages
- `libs/kafka/src/kafka-consumer.service.ts` — update `EventEnvelope<unknown>` usages
- `libs/kafka/src/kafka-producer.service.ts` — update `EventEnvelope<T>` usages
- `apps/catalog/src/shows/services/shows.service.ts` — imports unchanged (still get same symbols from `@app/contracts`)
- `apps/seating/src/messaging/consumers/show-published.consumer.ts` — imports unchanged

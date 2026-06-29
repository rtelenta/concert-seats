## Context

`libs/contracts` (`@app/contracts`) is the NestJS shared library that all services import for event/command types. Currently it only contains `EventEnvelope`, `ShowPublishedPayload`, `ShowPublishedSeat`, `SHOW_PUBLISHED`, `SHOW_EVENTS_TOPIC`, plus empty `ContractsModule`/`ContractsService` boilerplate.

The root `contracts/` package has the complete and well-organized type definitions for all domain events (catalog, seating, booking, payment), commands, topics, and event-type constants — but it is going to be deleted. All of this must be moved into `libs/contracts` so services continue to compile and work.

Current `EventEnvelope` in `libs/contracts` has signature `EventEnvelope<T = unknown>` (single type param for payload). The root contracts version uses `EventEnvelope<TType extends string = string, TPayload = unknown>` (two params), which enables typed discriminated unions like `type SeatHeld = EventEnvelope<'SeatHeld', SeatHeldPayload>`. Existing lib consumers call `EventEnvelope<unknown>` (treating the first param as payload).

## Goals / Non-Goals

**Goals:**
- Full parity of type definitions between root `contracts/` and `libs/contracts/` (minus zod schemas)
- No broken TypeScript compilation anywhere in the monorepo
- Existing `@app/contracts` consumers continue to import the same symbols without changes
- `libs/contracts/src/` organized with subdirectories matching the root contracts structure

**Non-Goals:**
- Migrating zod schemas or runtime validation
- Deleting the root `contracts/` folder (out of scope for this change)
- Modifying how services produce or consume Kafka messages
- Adding new events or commands

## Decisions

**1. EventEnvelope signature: adopt two-type-parameter form**

Adopt `EventEnvelope<TType extends string = string, TPayload = unknown>` from root contracts. This is the right long-term shape because it enables precise discriminated unions (`SeatHeld`, `BookingConfirmed`, etc.).

Existing usages of `EventEnvelope<unknown>` must be updated to `EventEnvelope<string, unknown>` (payload in second position). There are only ~5 call sites, all in `libs/kafka`.

*Alternative considered*: keep single-param and define event types as `EventEnvelope<SeatHeldPayload> & { eventType: 'SeatHeld' }`. Rejected because it's non-idiomatic and loses the clean two-param pattern already established in root contracts.

**2. Backward-compat named exports for existing consumers**

`SHOW_PUBLISHED` and `SHOW_EVENTS_TOPIC` are currently exported directly from `libs/contracts`. These will continue to be exported (either kept in `events/catalog.events.ts` or re-exported from `index.ts`), so `apps/catalog` and `apps/seating` need zero import changes.

Note: `SHOW_EVENTS_TOPIC = 'show-events'` does NOT match root contracts `TOPICS.CATALOG = 'catalog'`. These are different Kafka topic strings. The existing constant is kept as-is; `TOPICS` is added alongside it. Services can migrate to `TOPICS` in a separate change.

**3. Remove ContractsModule / ContractsService boilerplate**

These are empty NestJS-generated stubs with no logic. A contracts lib is types-only; no module wiring is needed. Removing them avoids confusion. Any service that imports `ContractsModule` would break — checked and none do currently.

**4. File organization**

Mirror root contracts structure exactly:
```
libs/contracts/src/
  envelope.ts          # EventEnvelope interface
  topics.ts            # TOPICS constant + Topic type
  event-types.ts       # EVENT_TYPES, COMMAND_TYPES constants + derived types
  events/
    catalog.events.ts  # ShowPublished (+ SHOW_PUBLISHED, SHOW_EVENTS_TOPIC)
    seating.events.ts  # SeatHeld, SeatHoldFailed, SeatHoldExpired, SeatReleased, SeatSold
    booking.events.ts  # BookingStarted, BookingConfirmed, BookingCancelled
    payment.events.ts  # PaymentSucceeded, PaymentFailed
  commands/
    index.ts           # HoldSeats, ReleaseSeats, ConfirmSeats, ProcessPayment
  index.ts             # re-exports + DomainEvent + Command union types
```

## Risks / Trade-offs

- [EventEnvelope two-param change] → any file using `EventEnvelope<SomePayload>` (single param) will fail — must grep and fix all call sites before the change is complete. Currently only `libs/kafka` files are affected; if any app files use it directly, those must be found and fixed too.
- [SHOW_EVENTS_TOPIC vs TOPICS.CATALOG mismatch] → services using different constants would publish/subscribe to different Kafka topics if accidentally mixed; mitigated by keeping both constants and not removing `SHOW_EVENTS_TOPIC`

## Migration Plan

1. Create new file structure in `libs/contracts/src/`
2. Update `EventEnvelope` signature (two params)
3. Update all `EventEnvelope<unknown>` usages in `libs/kafka/`
4. Update `libs/contracts/src/index.ts` with all re-exports
5. Run `pnpm tsc --noEmit` at monorepo root to verify zero type errors
6. Delete `ContractsModule`, `ContractsService`, and their spec file

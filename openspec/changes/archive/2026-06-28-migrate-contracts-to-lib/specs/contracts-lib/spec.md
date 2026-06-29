# contracts-lib

## Overview

`libs/contracts` (`@app/contracts`) is the single source of truth for all event and command type definitions in the monorepo. It provides TypeScript interfaces and constants used by every service to produce and consume Kafka messages. No runtime validation (zod) lives here — only types and constants.

## Requirements

### File structure

The library is organized as:

```
libs/contracts/src/
  envelope.ts          # EventEnvelope<TType, TPayload> interface
  topics.ts            # TOPICS object + Topic type
  event-types.ts       # EVENT_TYPES, COMMAND_TYPES objects + derived types
  events/
    catalog.events.ts
    seating.events.ts
    booking.events.ts
    payment.events.ts
  commands/
    index.ts
  index.ts             # barrel re-export + DomainEvent + Command union types
```

### EventEnvelope

```ts
export interface EventEnvelope<
  TType extends string = string,
  TPayload = unknown,
> {
  eventId: string;
  eventType: TType;
  occurredAt: string;       // ISO-8601
  correlationId: string;
  causationId?: string;     // optional — not every event has a cause
  version: number;
  payload: TPayload;
}
```

### Topics

```ts
export const TOPICS = {
  CATALOG: 'catalog',
  SEATING: 'seating',
  SEATING_COMMANDS: 'seating.commands',
  BOOKING: 'booking',
  PAYMENT: 'payment',
  PAYMENT_COMMANDS: 'payment.commands',
  DLQ: 'dead-letter',
} as const;

export type Topic = (typeof TOPICS)[keyof typeof TOPICS];
```

### Event Types

```ts
export const EVENT_TYPES = {
  ShowPublished: 'ShowPublished',
  SeatHeld: 'SeatHeld',
  SeatHoldFailed: 'SeatHoldFailed',
  SeatHoldExpired: 'SeatHoldExpired',
  SeatReleased: 'SeatReleased',
  SeatSold: 'SeatSold',
  BookingStarted: 'BookingStarted',
  BookingConfirmed: 'BookingConfirmed',
  BookingCancelled: 'BookingCancelled',
  PaymentSucceeded: 'PaymentSucceeded',
  PaymentFailed: 'PaymentFailed',
} as const;

export const COMMAND_TYPES = {
  HoldSeats: 'HoldSeats',
  ReleaseSeats: 'ReleaseSeats',
  ConfirmSeats: 'ConfirmSeats',
  ProcessPayment: 'ProcessPayment',
} as const;

export type EventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES];
export type CommandType = (typeof COMMAND_TYPES)[keyof typeof COMMAND_TYPES];
```

### Catalog Events

```ts
// events/catalog.events.ts
export const SHOW_PUBLISHED = 'ShowPublished';   // backward compat
export const SHOW_EVENTS_TOPIC = 'show-events';  // backward compat

export interface ShowPublishedSeat {
  seatDefinitionId: string;
  section: string;
  row: string;
  number: number;
  price: number;
}
export interface ShowPublishedPayload {
  showId: string;
  title: string;
  artist: string;
  dateTime: string;
  venueId: string;
  seats: ShowPublishedSeat[];
}
export type ShowPublished = EventEnvelope<'ShowPublished', ShowPublishedPayload>;
```

### Seating Events

```ts
// events/seating.events.ts
export interface SeatHeldPayload { showId: string; bookingId: string; seatIds: string[]; heldUntil: string; }
export type SeatHeld = EventEnvelope<'SeatHeld', SeatHeldPayload>;

export interface SeatHoldFailedPayload { showId: string; bookingId: string; seatIds: string[]; reason: string; }
export type SeatHoldFailed = EventEnvelope<'SeatHoldFailed', SeatHoldFailedPayload>;

export interface SeatHoldExpiredPayload { showId: string; bookingId: string; seatIds: string[]; }
export type SeatHoldExpired = EventEnvelope<'SeatHoldExpired', SeatHoldExpiredPayload>;

export interface SeatReleasedPayload { showId: string; seatIds: string[]; }
export type SeatReleased = EventEnvelope<'SeatReleased', SeatReleasedPayload>;

export interface SeatSoldPayload { showId: string; bookingId: string; seatIds: string[]; }
export type SeatSold = EventEnvelope<'SeatSold', SeatSoldPayload>;
```

### Booking Events

```ts
// events/booking.events.ts
export interface BookingStartedPayload { bookingId: string; userId: string; showId: string; seatIds: string[]; }
export type BookingStarted = EventEnvelope<'BookingStarted', BookingStartedPayload>;

export interface BookingConfirmedPayload { bookingId: string; userId: string; showId: string; seatIds: string[]; totalCents: number; }
export type BookingConfirmed = EventEnvelope<'BookingConfirmed', BookingConfirmedPayload>;

export interface BookingCancelledPayload { bookingId: string; userId: string; reason: string; }
export type BookingCancelled = EventEnvelope<'BookingCancelled', BookingCancelledPayload>;
```

### Payment Events

```ts
// events/payment.events.ts
export interface PaymentSucceededPayload { paymentId: string; bookingId: string; amountCents: number; }
export type PaymentSucceeded = EventEnvelope<'PaymentSucceeded', PaymentSucceededPayload>;

export interface PaymentFailedPayload { bookingId: string; reason: string; }
export type PaymentFailed = EventEnvelope<'PaymentFailed', PaymentFailedPayload>;
```

### Commands

```ts
// commands/index.ts
export interface HoldSeatsPayload { showId: string; bookingId: string; seatIds: string[]; ttlSeconds: number; }
export type HoldSeats = EventEnvelope<'HoldSeats', HoldSeatsPayload>;

export interface ReleaseSeatsPayload { showId: string; bookingId: string; seatIds: string[]; }
export type ReleaseSeats = EventEnvelope<'ReleaseSeats', ReleaseSeatsPayload>;

export interface ConfirmSeatsPayload { showId: string; bookingId: string; seatIds: string[]; }
export type ConfirmSeats = EventEnvelope<'ConfirmSeats', ConfirmSeatsPayload>;

export interface ProcessPaymentPayload { bookingId: string; userId: string; amountCents: number; }
export type ProcessPayment = EventEnvelope<'ProcessPayment', ProcessPaymentPayload>;
```

### Union Types (index.ts)

```ts
export type DomainEvent =
  | ShowPublished
  | SeatHeld | SeatHoldFailed | SeatHoldExpired | SeatReleased | SeatSold
  | BookingStarted | BookingConfirmed | BookingCancelled
  | PaymentSucceeded | PaymentFailed;

export type Command = HoldSeats | ReleaseSeats | ConfirmSeats | ProcessPayment;
```

### libs/kafka compatibility

All `EventEnvelope<unknown>` usages in `libs/kafka` must be updated to `EventEnvelope<string, unknown>` (payload moves to the second type parameter). `EventEnvelope<T>` in `kafka-producer.service.ts` must become `EventEnvelope<string, T>`.

## Scenarios

### Scenario: services import the same symbols, zero changes needed

Given `apps/catalog/shows.service.ts` imports `{ SHOW_EVENTS_TOPIC, SHOW_PUBLISHED, ShowPublishedPayload, ShowPublishedSeat }` from `@app/contracts`  
When the migration is complete  
Then all four symbols are still exported from `@app/contracts` and the file compiles without changes

### Scenario: kafka lib compiles with updated EventEnvelope

Given `libs/kafka/src/kafka.types.ts` used `EventEnvelope<unknown>`  
When updated to `EventEnvelope<string, unknown>`  
Then the file compiles and the `MessageHandler` type still accepts any envelope

### Scenario: new event types are importable

Given `apps/seating` wants to type a SeatHeld event  
When it imports `{ SeatHeld, SeatHeldPayload }` from `@app/contracts`  
Then the import resolves and `SeatHeld` is properly typed as `EventEnvelope<'SeatHeld', SeatHeldPayload>`

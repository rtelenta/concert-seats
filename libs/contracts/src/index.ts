export * from './envelope';
export * from './topics';
export * from './event-types';
export * from './events/catalog.events';
export * from './events/seating.events';
export * from './events/booking.events';
export * from './events/payment.events';
export * from './commands';

import { ShowPublished } from './events/catalog.events';
import {
  SeatHeld,
  SeatHoldFailed,
  SeatHoldExpired,
  SeatReleased,
  SeatSold,
} from './events/seating.events';
import {
  BookingStarted,
  BookingConfirmed,
  BookingCancelled,
} from './events/booking.events';
import { PaymentSucceeded, PaymentFailed } from './events/payment.events';
import {
  HoldSeats,
  ReleaseSeats,
  ConfirmSeats,
  ProcessPayment,
} from './commands';

/**
 * Discriminated union of ALL domain events.
 * Allows `switch (event.eventType)` with automatic payload narrowing
 * and exhaustiveness checking in consumers.
 */
export type DomainEvent =
  | ShowPublished
  | SeatHeld
  | SeatHoldFailed
  | SeatHoldExpired
  | SeatReleased
  | SeatSold
  | BookingStarted
  | BookingConfirmed
  | BookingCancelled
  | PaymentSucceeded
  | PaymentFailed;

/** Union of all commands. */
export type Command = HoldSeats | ReleaseSeats | ConfirmSeats | ProcessPayment;

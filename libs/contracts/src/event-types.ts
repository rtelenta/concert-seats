/**
 * Type constants. Use them when building and discriminating messages
 * to avoid magic strings scattered throughout the code.
 */
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

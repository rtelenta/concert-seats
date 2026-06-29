import { EventEnvelope } from '../envelope';

export interface SeatHeldPayload {
  showId: string;
  bookingId: string;
  seatIds: string[];
  heldUntil: string;
}
export type SeatHeld = EventEnvelope<'SeatHeld', SeatHeldPayload>;

export interface SeatHoldFailedPayload {
  showId: string;
  bookingId: string;
  seatIds: string[];
  reason: string;
}
export type SeatHoldFailed = EventEnvelope<
  'SeatHoldFailed',
  SeatHoldFailedPayload
>;

export interface SeatHoldExpiredPayload {
  showId: string;
  bookingId: string;
  seatIds: string[];
}
export type SeatHoldExpired = EventEnvelope<
  'SeatHoldExpired',
  SeatHoldExpiredPayload
>;

export interface SeatReleasedPayload {
  showId: string;
  seatIds: string[];
}
export type SeatReleased = EventEnvelope<'SeatReleased', SeatReleasedPayload>;

export interface SeatSoldPayload {
  showId: string;
  bookingId: string;
  seatIds: string[];
}
export type SeatSold = EventEnvelope<'SeatSold', SeatSoldPayload>;

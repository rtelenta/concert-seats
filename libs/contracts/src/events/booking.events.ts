import { EventEnvelope } from '../envelope';

export interface BookingStartedPayload {
  bookingId: string;
  userId: string;
  showId: string;
  seatIds: string[];
}
export type BookingStarted = EventEnvelope<
  'BookingStarted',
  BookingStartedPayload
>;

export interface BookingConfirmedPayload {
  bookingId: string;
  userId: string;
  showId: string;
  seatIds: string[];
  totalCents: number;
}
export type BookingConfirmed = EventEnvelope<
  'BookingConfirmed',
  BookingConfirmedPayload
>;

export interface BookingCancelledPayload {
  bookingId: string;
  userId: string;
  reason: string;
}
export type BookingCancelled = EventEnvelope<
  'BookingCancelled',
  BookingCancelledPayload
>;

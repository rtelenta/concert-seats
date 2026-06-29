import { EventEnvelope } from '../envelope';

export interface HoldSeatsPayload {
  showId: string;
  bookingId: string;
  seatIds: string[];
  ttlSeconds: number;
}
export type HoldSeats = EventEnvelope<'HoldSeats', HoldSeatsPayload>;

export interface ReleaseSeatsPayload {
  showId: string;
  bookingId: string;
  seatIds: string[];
}
export type ReleaseSeats = EventEnvelope<'ReleaseSeats', ReleaseSeatsPayload>;

export interface ConfirmSeatsPayload {
  showId: string;
  bookingId: string;
  seatIds: string[];
}
export type ConfirmSeats = EventEnvelope<'ConfirmSeats', ConfirmSeatsPayload>;

export interface ProcessPaymentPayload {
  bookingId: string;
  userId: string;
  amountCents: number;
}
export type ProcessPayment = EventEnvelope<
  'ProcessPayment',
  ProcessPaymentPayload
>;

import { EventEnvelope } from '../envelope';

export interface PaymentSucceededPayload {
  paymentId: string;
  bookingId: string;
  amountCents: number;
}
export type PaymentSucceeded = EventEnvelope<
  'PaymentSucceeded',
  PaymentSucceededPayload
>;

export interface PaymentFailedPayload {
  bookingId: string;
  reason: string;
}
export type PaymentFailed = EventEnvelope<
  'PaymentFailed',
  PaymentFailedPayload
>;

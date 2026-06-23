export interface EventEnvelope<T = unknown> {
  eventId: string;
  eventType: string;
  occurredAt: string;
  correlationId: string;
  causationId: string;
  version: number;
  payload: T;
}

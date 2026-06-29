/**
 * Common envelope that wraps EVERY message (event or command) travelling through Kafka.
 *
 * - eventId:       unique identifier → idempotency (dedup at the consumer).
 * - eventType:     type discriminator (literal string).
 * - occurredAt:    when the fact occurred (ISO-8601).
 * - correlationId: same value across an entire saga → allows tracing the flow end-to-end.
 * - causationId:   the eventId of the message that caused this one (causality chain).
 * - version:       payload contract version (Event Versioning).
 * - payload:       the data of the fact.
 */
export interface EventEnvelope<
  TType extends string = string,
  TPayload = unknown,
> {
  eventId: string;
  eventType: TType;
  occurredAt: string;
  correlationId: string;
  causationId?: string;
  version: number;
  payload: TPayload;
}

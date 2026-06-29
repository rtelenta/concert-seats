/**
 * Kafka topic names. ALWAYS use these constants (not raw strings)
 * to avoid typos that silently break communication.
 *
 * Convention: event topics named after the producer service;
 * command topics suffixed with '.commands' (directed at a specific service).
 */
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

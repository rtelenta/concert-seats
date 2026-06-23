import { Context } from '@opentelemetry/api';
import { ZodSchema } from 'zod';
import { EventEnvelope } from '@app/contracts';
import type { SASLOptions } from 'kafkajs';

export type { SASLOptions };

export interface KafkaModuleOptions {
  brokers: string[];
  clientId: string;
  groupId: string;
  ssl?: boolean;
  sasl?: SASLOptions;
}

export type MessageHandler = (
  envelope: EventEnvelope<unknown>,
  ctx: Context,
) => Promise<void>;

export interface SubscribeOptions {
  topics: string[];
  handler: MessageHandler;
  isProcessed: (eventId: string) => Promise<boolean>;
  markProcessed: (eventId: string) => Promise<void>;
  schemaResolver?: (eventType: string) => ZodSchema | undefined;
}

export const KAFKA_OPTIONS = 'KAFKA_OPTIONS';
export const KAFKA_INSTANCE = 'KAFKA_INSTANCE';

import {
  Inject,
  Injectable,
  Logger,
  OnApplicationShutdown,
} from '@nestjs/common';
import { Consumer, Kafka, Producer } from 'kafkajs';
import { context as otelContext } from '@opentelemetry/api';
import { KafkaPropagator } from '@app/telemetry';
import { EventEnvelope } from '@app/contracts';
import {
  KAFKA_INSTANCE,
  KAFKA_OPTIONS,
  KafkaModuleOptions,
  SubscribeOptions,
} from './kafka.types';

@Injectable()
export class KafkaConsumer implements OnApplicationShutdown {
  private readonly logger = new Logger(KafkaConsumer.name);
  private consumer: Consumer;
  private dlqProducer: Producer;
  private connected = false;

  constructor(
    @Inject(KAFKA_INSTANCE) kafka: Kafka,
    @Inject(KAFKA_OPTIONS) opts: KafkaModuleOptions,
  ) {
    this.consumer = kafka.consumer({ groupId: opts.groupId });
    this.dlqProducer = kafka.producer();
  }

  async onApplicationShutdown(): Promise<void> {
    if (this.connected) {
      await this.consumer.disconnect();
      await this.dlqProducer.disconnect();
    }
  }

  async subscribe(options: SubscribeOptions): Promise<void> {
    const { topics, handler, isProcessed, markProcessed, schemaResolver } =
      options;

    await this.dlqProducer.connect();
    await this.consumer.connect();
    this.connected = true;

    await this.consumer.subscribe({ topics, fromBeginning: false });

    await this.consumer.run({
      autoCommit: false,
      eachMessage: async ({ topic, partition, message }) => {
        const stringHeaders = headersToRecord(message.headers ?? {});
        const ctx = KafkaPropagator.extract(stringHeaders);

        let envelope: EventEnvelope<string, unknown>;
        try {
          const raw = JSON.parse(message.value?.toString() ?? '');

          if (schemaResolver) {
            const schema = schemaResolver(raw?.eventType);
            if (schema) {
              schema.parse(raw);
            }
          }

          envelope = raw as EventEnvelope<string, unknown>;
        } catch (err) {
          this.logger.warn(
            { topic, offset: message.offset, err },
            'invalid message → dlq',
          );
          await this.sendToDlq(
            topic,
            message.key?.toString() ?? '',
            message.value,
          );
          await this.commitOffset(topic, partition, message.offset);
          return;
        }

        if (await isProcessed(envelope.eventId)) {
          await this.commitOffset(topic, partition, message.offset);
          return;
        }

        try {
          await otelContext.with(ctx, () => handler(envelope, ctx));
          await markProcessed(envelope.eventId);
          await this.commitOffset(topic, partition, message.offset);
        } catch (err) {
          this.logger.error(
            { topic, eventId: envelope.eventId, err },
            'handler failed — offset not committed',
          );
        }
      },
    });
  }

  private async sendToDlq(
    topic: string,
    key: string,
    value: Buffer | null | undefined,
  ): Promise<void> {
    try {
      await this.dlqProducer.send({
        topic: `${topic}.dlq`,
        messages: [{ key, value: value ?? null }],
      });
    } catch (err) {
      this.logger.error({ topic, err }, 'failed to send to dlq');
    }
  }

  private async commitOffset(
    topic: string,
    partition: number,
    offset: string,
  ): Promise<void> {
    await this.consumer.commitOffsets([
      { topic, partition, offset: String(BigInt(offset) + 1n) },
    ]);
  }
}

function headersToRecord(
  headers: Record<string, Buffer | string | (Buffer | string)[] | undefined>,
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (value === undefined) continue;
    const first = Array.isArray(value) ? value[0] : value;
    if (first !== undefined) {
      result[key] = Buffer.isBuffer(first) ? first.toString('utf8') : first;
    }
  }
  return result;
}

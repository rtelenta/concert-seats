import {
  Inject,
  Injectable,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { Producer, Kafka } from 'kafkajs';
import { KafkaPropagator } from '@app/telemetry';
import { EventEnvelope } from '@app/contracts';
import { KAFKA_INSTANCE } from './kafka.types';

@Injectable()
export class KafkaProducer implements OnApplicationBootstrap, OnApplicationShutdown {
  private producer: Producer;

  constructor(@Inject(KAFKA_INSTANCE) kafka: Kafka) {
    this.producer = kafka.producer();
  }

  async onApplicationBootstrap(): Promise<void> {
    await this.producer.connect();
  }

  async onApplicationShutdown(): Promise<void> {
    await this.producer.disconnect();
  }

  async publish<T>(topic: string, key: string, envelope: EventEnvelope<T>): Promise<void> {
    const headers: Record<string, string> = {};
    KafkaPropagator.inject(headers);

    await this.producer.send({
      topic,
      messages: [
        {
          key,
          value: JSON.stringify(envelope),
          headers,
        },
      ],
    });
  }
}

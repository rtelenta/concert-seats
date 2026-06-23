import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { Admin, Kafka, ITopicConfig } from 'kafkajs';
import { KAFKA_INSTANCE } from './kafka.types';

@Injectable()
export class KafkaAdminService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new Logger(KafkaAdminService.name);
  private admin: Admin;

  constructor(@Inject(KAFKA_INSTANCE) kafka: Kafka) {
    this.admin = kafka.admin();
  }

  async onApplicationBootstrap(): Promise<void> {
    await this.admin.connect();
  }

  async onApplicationShutdown(): Promise<void> {
    await this.admin.disconnect();
  }

  async ensureTopics(
    topics: Pick<
      ITopicConfig,
      'topic' | 'numPartitions' | 'replicationFactor'
    >[],
  ): Promise<void> {
    const existing = new Set(await this.admin.listTopics());
    const toCreate = topics.filter((t) => !existing.has(t.topic));
    if (toCreate.length === 0) return;
    await this.admin.createTopics({ topics: toCreate, waitForLeaders: true });
    this.logger.log(
      `Created topics: ${toCreate.map((t) => t.topic).join(', ')}`,
    );
  }
}

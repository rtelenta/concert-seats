import {
  DynamicModule,
  Global,
  Module,
  ModuleMetadata,
  Provider,
} from '@nestjs/common';
import { Kafka } from 'kafkajs';
import { KafkaModuleOptions, KAFKA_INSTANCE, KAFKA_OPTIONS } from './kafka.types';
import { KafkaProducer } from './kafka-producer.service';
import { KafkaConsumer } from './kafka-consumer.service';
import { KafkaAdminService } from './kafka-admin.service';

export interface KafkaModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory: (...args: unknown[]) => Promise<KafkaModuleOptions> | KafkaModuleOptions;
  inject?: unknown[];
}

@Global()
@Module({})
export class KafkaModule {
  static forRoot(options: KafkaModuleOptions): DynamicModule {
    const providers = KafkaModule.createProviders(options);
    return {
      module: KafkaModule,
      providers,
      exports: [KafkaProducer, KafkaConsumer, KafkaAdminService],
    };
  }

  static forRootAsync(asyncOptions: KafkaModuleAsyncOptions): DynamicModule {
    const asyncProvider: Provider = {
      provide: KAFKA_OPTIONS,
      useFactory: asyncOptions.useFactory,
      inject: (asyncOptions.inject as never[]) ?? [],
    };
    const instanceProvider: Provider = {
      provide: KAFKA_INSTANCE,
      useFactory: (opts: KafkaModuleOptions) =>
        new Kafka({
          clientId: opts.clientId,
          brokers: opts.brokers,
          ssl: opts.ssl,
          sasl: opts.sasl,
        }),
      inject: [KAFKA_OPTIONS],
    };
    return {
      module: KafkaModule,
      imports: asyncOptions.imports ?? [],
      providers: [
        asyncProvider,
        instanceProvider,
        KafkaProducer,
        KafkaConsumer,
        KafkaAdminService,
      ],
      exports: [KafkaProducer, KafkaConsumer, KafkaAdminService],
    };
  }

  private static createProviders(options: KafkaModuleOptions): Provider[] {
    return [
      { provide: KAFKA_OPTIONS, useValue: options },
      {
        provide: KAFKA_INSTANCE,
        useFactory: (opts: KafkaModuleOptions) =>
          new Kafka({
            clientId: opts.clientId,
            brokers: opts.brokers,
            ssl: opts.ssl,
            sasl: opts.sasl,
          }),
        inject: [KAFKA_OPTIONS],
      },
      KafkaProducer,
      KafkaConsumer,
      KafkaAdminService,
    ];
  }
}

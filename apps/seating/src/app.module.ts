import { APP_INTERCEPTOR } from '@nestjs/core';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KafkaModule } from '@app/kafka';
import { LoggingInterceptor } from '@app/common';
import { TelemetryModule } from '@app/telemetry';
import { AppController } from './app.controller';
import appConfig from './config/app.config';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';
import { SeatsModule } from './seats/seats.module';
import { MessagingModule } from './messaging/messaging.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [appConfig] }),
    TelemetryModule.forRoot({
      serviceName: 'seating',
      enabled: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('app.databaseUrl'),
        ssl: { rejectUnauthorized: false },
        synchronize: false,
        autoLoadEntities: true,
        extra: { max: 2 },
        migrations: [__dirname + '/database/migrations/*.{ts,js}'],
        migrationsTableName: 'seating_migrations',
      }),
    }),
    KafkaModule.forRootAsync({
      inject: [ConfigService],
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        clientId: 'seating',
        brokers: config.get<string[]>('app.kafkaBrokers')!,
        groupId: 'seating',
      }),
    }),
    SeatsModule,
    MessagingModule,
  ],
  controllers: [AppController],
  providers: [{ provide: APP_INTERCEPTOR, useClass: LoggingInterceptor }],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}

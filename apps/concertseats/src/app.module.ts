import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { TelemetryModule } from '@app/telemetry';
import { AuthModule } from './guards/auth.module';
import { ShowsModule } from './shows/shows.module';
import { VenuesModule } from './venues/venues.module';
import appConfig from './config/app.config';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';
import { HttpClientModule } from './common/http-client.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [appConfig] }),
    TelemetryModule.forRoot({
      serviceName: 'concertseats',
      enabled: true,
    }),
    HttpClientModule,
    AuthModule,
    ShowsModule,
    VenuesModule,
  ],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}

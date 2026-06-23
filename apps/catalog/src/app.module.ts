import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { TelemetryModule } from '@app/telemetry';
import appConfig from './config/app.config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [appConfig] }),
    TelemetryModule.forRoot({
      serviceName: 'catalog',
      enabled: true,
    }),
  ],
  controllers: [AppController],
})
export class AppModule {}

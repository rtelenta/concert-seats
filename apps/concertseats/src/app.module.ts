import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { TelemetryModule } from '@app/telemetry';
import { AuthModule } from './guards/auth.module';
import { ShowsModule } from './shows/shows.module';
import { VenuesModule } from './venues/venues.module';
import appConfig from './config/app.config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [appConfig] }),
    TelemetryModule.forRoot({
      serviceName: 'concertseats',
      enabled: true,
    }),
    AuthModule,
    ShowsModule,
    VenuesModule,
  ],
  controllers: [AppController],
})
export class AppModule {}

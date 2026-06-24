import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { TelemetryModule } from '@app/telemetry';
import appConfig from './config/app.config';
import { ShowsModule } from './shows/shows.module';
import { VenuesModule } from './venues/venues.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [appConfig] }),
    TelemetryModule.forRoot({
      serviceName: 'catalog',
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
        migrationsTableName: 'catalog_migrations',
      }),
    }),
    VenuesModule,
    ShowsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}

import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.CATALOG_PORT ?? process.env.PORT ?? '3000'),
  databaseUrl: process.env.CATALOG_DATABASE_URL,
  kafkaBrokers: (process.env.KAFKA_BROKERS ?? 'localhost:19092').split(','),
}));

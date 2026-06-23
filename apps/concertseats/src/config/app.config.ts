import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.CONCERTSEATS_PORT ?? process.env.PORT ?? '3000'),
  databaseUrl: process.env.READMODEL_DATABASE_URL,
}));

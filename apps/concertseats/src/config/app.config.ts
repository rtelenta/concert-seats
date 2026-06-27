import { registerAs } from '@nestjs/config';

export default registerAs('app', () => {
  const rawOrigins = process.env.CORS_ORIGINS;
  if (!rawOrigins) {
    throw new Error('CORS_ORIGINS environment variable is required');
  }
  const corsOrigins = rawOrigins.split(',').map((o) => o.trim()).filter(Boolean);
  if (corsOrigins.length === 0) {
    throw new Error('CORS_ORIGINS must contain at least one origin');
  }
  return {
    port: parseInt(process.env.CONCERTSEATS_PORT ?? process.env.PORT ?? '3000'),
    databaseUrl: process.env.READMODEL_DATABASE_URL,
    corsOrigins,
  };
});

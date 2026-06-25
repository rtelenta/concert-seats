import { bootstrapTelemetry } from '@app/telemetry';

bootstrapTelemetry({
  serviceName: 'seating',
  enabled: true,
});

import { NestFactory } from '@nestjs/core';
import { ConfigType } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import appConfig from './config/app.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get<ConfigType<typeof appConfig>>(appConfig.KEY);

  if (process.env.NODE_ENV !== 'production') {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('Seating Service')
        .setVersion('1.0')
        .build(),
    );
    SwaggerModule.setup('/docs', app, document);
  }

  await app.listen(config.port);
}
void bootstrap();

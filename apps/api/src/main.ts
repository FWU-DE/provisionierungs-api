import './instrumentation';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { DataSource } from 'typeorm';

import { Logger } from './common/logger';
import { MainModule } from './main.module';

const logger = Logger.withFormatterFromEnv();
logger.setContext('Bootstrap');

async function bootstrap() {
  const app = await NestFactory.create(MainModule);
  await runMigrations(app.get(DataSource));

  // Enable NestJS Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableShutdownHooks();

  const config = new DocumentBuilder()
    .setTitle('VIDIS Rostering API')
    .setDescription(
      'VIDIS Rostering API. All routes are authenticated using an OAuth Bearer Token.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('openapi', app, document);

  const port = process.env.PORT ?? 3010;
  await app.listen(port);
  logger.log(`Application successfully started on port ${port.toString()}.`);
}

bootstrap().catch((err: unknown) => {
  logger.error('Error during app bootstrap:', err);
});

async function runMigrations(connection: DataSource) {
  const migrations = await connection.runMigrations({ transaction: 'each' });
  for (const migration of migrations) {
    logger.log(`Executed migration: ${migration.name}`);
  }
}

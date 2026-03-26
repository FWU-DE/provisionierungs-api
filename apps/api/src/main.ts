import './instrumentation';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { DataSource } from 'typeorm';

import { MainModule } from './main.module';

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

  await app.listen(process.env.PORT ?? 3010);
}

bootstrap().catch((err: unknown) => {
  // eslint-disable-next-line no-console
  console.error('Error during app bootstrap:', err);
});

async function runMigrations(connection: DataSource) {
  const migrations = await connection.runMigrations({ transaction: 'each' });
  for (const migration of migrations) {
    // eslint-disable-next-line no-console
    console.log(`Executed migration: ${migration.name}`);
  }
}

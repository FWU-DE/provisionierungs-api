import { NestFactory } from '@nestjs/core';

import { MainModule } from './main.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(MainModule);

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

  // eslint-disable-next-line turbo/no-undeclared-env-vars
  await app.listen(process.env.PORT ?? 3010);
}

bootstrap().catch((err: unknown) => {
  console.error('Error during app bootstrap:', err);
});

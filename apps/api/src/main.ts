import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  await app.listen(process.env.PORT ?? 3010);
}
bootstrap().catch((err: unknown) => {
  console.error('Error during app bootstrap:', err);
});

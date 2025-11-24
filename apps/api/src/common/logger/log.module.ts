import type { MiddlewareConsumer, NestModule } from '@nestjs/common';
import { Module, RequestMethod, Scope } from '@nestjs/common';

import { HttpLoggingMiddleware } from './http-logging-middleware';
import { Logger } from './logger';

@Module({
  providers: [
    {
      provide: Logger,
      scope: Scope.TRANSIENT,
      useFactory() {
        return Logger.withFormatterFromEnv();
      },
    },
  ],
  exports: [Logger],
})
export class LogModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(HttpLoggingMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}

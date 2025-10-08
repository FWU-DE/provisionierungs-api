import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth';
import authConfig from './config/auth.config';
import { DatabaseProviderModule } from './database/database.module';
import { LogModule } from './logger';
import { ControllerModule } from './controller/controller.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [authConfig],
      expandVariables: true,
    }),
    DatabaseProviderModule,

    AuthModule,
    LogModule,
    ControllerModule,
  ],
})
export class MainModule {}

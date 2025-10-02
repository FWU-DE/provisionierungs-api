import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth';
import authConfig from './config/auth.config';
import { DatabaseProviderModule } from './database/database.module';
import { LogModule } from './logger';
import { RosterApiModule } from './roster-api/roster-api.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [authConfig],
      expandVariables: true,
    }),
    DatabaseProviderModule,

    AuthModule,
    LogModule,
    RosterApiModule,
  ],
})
export class MainModule {}

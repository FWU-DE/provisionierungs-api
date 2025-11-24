import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './common/auth';
import authConfig from './common/auth/config/auth.config';
import { DatabaseProviderModule } from './common/database/database.module';
import { LogModule } from './common/logger';
import { ControllerModule } from './controller/controller.module';
import { GraphQLModule } from './common/graphql/graphql.module';
import { OffersModule } from './offers/offers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [authConfig],
      expandVariables: true,
    }),
    DatabaseProviderModule,
    GraphQLModule,
    AuthModule,
    LogModule,
    ControllerModule,
    OffersModule,
  ],
})
export class MainModule {}

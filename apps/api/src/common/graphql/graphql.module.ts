import type { ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloDriver } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule as NestGraphQLModule } from '@nestjs/graphql';

import { LogModule } from '../logger';
import { LoggingPlugin } from './logging.plugin';
import appConfig, { NodeEnv, type AppConfig } from '../../config/app.config';

@Module({
  imports: [
    NestGraphQLModule.forRootAsync<ApolloDriverConfig>({
      imports: [ConfigModule.forFeature(appConfig)],
      inject: [appConfig.KEY],
      driver: ApolloDriver,
      useFactory: (appConfig: AppConfig) => ({
        playground: appConfig.NODE_ENV === NodeEnv.DEVELOPMENT,
        resolverValidationOptions: {
          requireResolversToMatchSchema:
            appConfig.NODE_ENV !== NodeEnv.TEST ? 'error' : 'ignore',
        },
        autoSchemaFile:
          appConfig.NODE_ENV === NodeEnv.DEVELOPMENT
            ? './schema/schema.graphql'
            : appConfig.NODE_ENV === NodeEnv.TEST
              ? '/tmp/vidis-rostering-api-schema.graphql'
              : true,
        sortSchema: true,
        introspection: appConfig.NODE_ENV === NodeEnv.DEVELOPMENT,
      }),
    }),
    LogModule,
  ],
  providers: [LoggingPlugin],
})
export class GraphQLModule {}

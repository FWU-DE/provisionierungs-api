import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { ConfigModule } from '@nestjs/config';
import authConfig from './config/auth.config';
import { LogModule } from '../logger';
import { AccessTokenGuard } from './guards/access-token.guard';
import { AllowedResourceOwnerTypesGuard } from './guards/allowed-resource-owner-types.guard';
import { PublicRouteEvaluator } from './guards/public-route.evaluator';
import { RequiredScopesGuard } from './guards/required-scopes.guard';
import { AccessTokenVerifierFactory } from './introspection/access-token-verifier.factory';
import { IntrospectionClient } from './introspection/introspection-client';
import { IntrospectionProvider } from './introspection/introspection.provider';
import { loggerProviderFactory } from './logger/logger.provider';

@Global()
@Module({
  imports: [ConfigModule.forFeature(authConfig), LogModule],
  providers: [
    loggerProviderFactory,
    PublicRouteEvaluator,
    IntrospectionProvider,
    IntrospectionClient,
    AccessTokenVerifierFactory,

    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RequiredScopesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AllowedResourceOwnerTypesGuard,
    },
  ],
  exports: [IntrospectionProvider],
})
export class AuthModule {}

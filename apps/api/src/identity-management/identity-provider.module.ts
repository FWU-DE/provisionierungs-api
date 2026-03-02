import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ClearanceModule } from '../clearance/clearance.module';
import { LogModule } from '../common/logger';
import { PseudonymizationModule } from '../pseudonymization/pseudonymization.module';
import { EduplacesStagingAdapter } from './adapter/eduplaces-staging/eduplaces-staging-adapter';
import { EduplacesAdapter } from './adapter/eduplaces/eduplaces-adapter';
import { SaarlandAdapter } from './adapter/saarland/saarland-adapter';
import { Aggregator } from './aggregator/aggregator';
import { ClientCredentialsProvider } from './authentication/client-credentials';
import { FormUrlEncodedProvider } from './authentication/form-url-encoded';
import idmEduplacesStagingConfig from './config/idm.eduplaces-staging.config';
import idmEduplacesConfig from './config/idm.eduplaces.config';
import idmSaarlandConfig from './config/idm.saarland.config';
import { SchulconnexFetcher } from './fetcher/schulconnex/schulconnex.fetcher';
import { GroupAllQuery } from './graphql/group-all.query';
import { PostRequestFilter } from './post-request-filter/post-request-filter';

@Module({
  imports: [
    ClearanceModule,
    ConfigModule.forFeature(idmEduplacesConfig),
    ConfigModule.forFeature(idmEduplacesStagingConfig),
    ConfigModule.forFeature(idmSaarlandConfig),
    LogModule,
    PseudonymizationModule,
  ],
  providers: [
    SchulconnexFetcher,
    EduplacesAdapter,
    EduplacesStagingAdapter,
    SaarlandAdapter,
    Aggregator,
    ClientCredentialsProvider,
    FormUrlEncodedProvider,
    GroupAllQuery,
    PostRequestFilter,
    SchulconnexFetcher,
  ],
  exports: [Aggregator, PostRequestFilter],
})
export class IdentityProviderModule {}

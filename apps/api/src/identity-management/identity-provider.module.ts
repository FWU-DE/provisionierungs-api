import { Module } from '@nestjs/common';
import { EduplacesAdapter } from './adapter/eduplaces/eduplaces-adapter';
import { SchulconnexFetcher } from './fetcher/schulconnex/schulconnex.fetcher';
import { ConfigModule } from '@nestjs/config';
import idmEduplacesConfig from './config/idm.eduplaces.config';
import { LogModule } from '../common/logger';
import { Aggregator } from './aggregator/aggregator';
import { ClientCredentialsProvider } from './authentication/client-credentials';
import idmEduplacesStagingConfig from './config/idm.eduplaces-staging.config';
import { EduplacesStagingAdapter } from './adapter/eduplaces-staging/eduplaces-staging-adapter';
import { ClearanceModule } from '../clearance/clearance.module';
import { PostRequestFilter } from './post-request-filter/post-request-filter';
import { PseudonymizationModule } from '../pseudonymization/pseudonymization.module';
import { GroupAllQuery } from './graphql/group-all.query';
import { DeByVidisIdpAdapter } from './adapter/DE-BY-vidis-idp/de-by-vidis-idp-adapter';
import idmDEBYVidisIdpConfig from './config/idm.DE-BY-vidis-idp.config';

@Module({
  imports: [
    LogModule,
    ClearanceModule,
    ConfigModule.forFeature(idmEduplacesConfig),
    ConfigModule.forFeature(idmEduplacesStagingConfig),
    ConfigModule.forFeature(idmDEBYVidisIdpConfig),
    PseudonymizationModule,
  ],
  providers: [
    SchulconnexFetcher,
    EduplacesAdapter,
    EduplacesStagingAdapter,
    DeByVidisIdpAdapter,
    Aggregator,
    ClientCredentialsProvider,
    PostRequestFilter,
    GroupAllQuery,
  ],
  exports: [Aggregator, PostRequestFilter],
})
export class IdentityProviderModule {}

import { Module } from '@nestjs/common';
import { EduplacesAdapter } from './adapter/eduplaces/eduplaces-adapter';
import { SchulconnexFetcher } from './fetcher/schulconnex/schulconnex.fetcher';
import { ConfigModule } from '@nestjs/config';
import idpEduplacesConfig from '../config/idp.eduplaces.config';
import { LogModule } from '../logger';
import { Aggregator } from './aggregator/aggregator';
import { ClientCredentialsProvider } from './authentication/client-credentials';
import idpEduplacesStagingConfig from '../config/idp.eduplaces-staging.config';
import { EduplacesStagingAdapter } from './adapter/eduplaces-staging/eduplaces-staging-adapter';
import { Pseudonymization } from '../pseudonymization/pseudonymize';
import pseudonymizationConfig from '../config/pseudonymization.config';
import { Hasher } from '../pseudonymization/hasher';

@Module({
  imports: [
    LogModule,
    ConfigModule.forFeature(idpEduplacesConfig),
    ConfigModule.forFeature(idpEduplacesStagingConfig),
    ConfigModule.forFeature(pseudonymizationConfig),
  ],
  providers: [
    SchulconnexFetcher,
    EduplacesAdapter,
    EduplacesStagingAdapter,
    Aggregator,
    ClientCredentialsProvider,
    Hasher,
    Pseudonymization,
  ],
  exports: [Aggregator],
})
export class IdentityProviderModule {}

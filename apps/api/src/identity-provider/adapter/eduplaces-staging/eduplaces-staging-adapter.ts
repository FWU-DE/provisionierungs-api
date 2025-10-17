import {
  AdapterGetPersonsReturnType,
  AdapterInterface,
} from '../adapter-interface';
import { Inject, Injectable } from '@nestjs/common';
import { SchulconnexFetcher } from '../../fetcher/schulconnex/schulconnex.fetcher';
import { SchulconnexQueryParameters } from '../../../controller/types/schulconnex';
import { transformSchulconnexResponse } from '../../fetcher/schulconnex/schulconnex.transformer';
import { ClientCredentialsProvider } from '../../authentication/client-credentials';
import idpEduplacesStagingConfig, {
  type EduplacesStagingConfig,
} from '../../../config/idp.eduplaces-staging.config';

@Injectable()
export class EduplacesStagingAdapter implements AdapterInterface {
  constructor(
    @Inject(idpEduplacesStagingConfig.KEY)
    private readonly idpEduplacesStagingConfig: EduplacesStagingConfig,
    @Inject(SchulconnexFetcher)
    private readonly schulconnexFetcher: SchulconnexFetcher,
    @Inject(ClientCredentialsProvider)
    private readonly clientCredentialsProvider: ClientCredentialsProvider,
  ) {}

  getIdentifier(): string {
    return 'eduplaces-staging';
  }

  async getPersons(
    parameters: SchulconnexQueryParameters,
  ): Promise<AdapterGetPersonsReturnType> {
    const authToken = await this.clientCredentialsProvider.authenticate(
      this.idpEduplacesStagingConfig.IDP_EDUPLACES_STAGING_TOKEN_ENDPOINT,
      this.idpEduplacesStagingConfig.IDP_EDUPLACES_STAGING_CLIENT_ID,
      this.idpEduplacesStagingConfig.IDP_EDUPLACES_STAGING_CLIENT_SECRET,
      'client_credentials',
      'urn:eduplaces:idm:v1:schools:read urn:eduplaces:idm:v1:groups:read urn:eduplaces:idm:v1:people:read',
    );

    const response = await this.schulconnexFetcher.fetchPersons(
      this.idpEduplacesStagingConfig.IDP_EDUPLACES_STAGING_API_ENDPOINT,
      parameters,
      authToken,
    );

    return {
      idp: this.getIdentifier(),
      response: transformSchulconnexResponse(response),
    };
  }
}

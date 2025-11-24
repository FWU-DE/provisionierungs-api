import {
  AdapterGetGroupsReturnType,
  AdapterGetPersonsReturnType,
  AdapterInterface,
} from '../adapter-interface';
import { Inject, Injectable } from '@nestjs/common';
import { SchulconnexFetcher } from '../../fetcher/schulconnex/schulconnex.fetcher';
import { SchulconnexQueryParameters } from '../../../controller/parameters/schulconnex-query-parameters';
import { transformSchulconnexPersonsResponse } from '../../fetcher/schulconnex/schulconnex.transformer';
import { ClientCredentialsProvider } from '../../authentication/client-credentials';
import idmEduplacesStagingConfig, {
  type EduplacesStagingConfig,
} from '../../config/idm.eduplaces-staging.config';
import { BearerToken } from '../../authentication/bearer-token';

@Injectable()
export class EduplacesStagingAdapter implements AdapterInterface {
  constructor(
    @Inject(idmEduplacesStagingConfig.KEY)
    private readonly idmEduplacesStagingConfig: EduplacesStagingConfig,
    @Inject(SchulconnexFetcher)
    private readonly schulconnexFetcher: SchulconnexFetcher,
    @Inject(ClientCredentialsProvider)
    private readonly clientCredentialsProvider: ClientCredentialsProvider,
  ) {}

  getIdentifier(): string {
    return 'eduplaces-staging';
  }

  private async getAuthToken(): Promise<BearerToken> {
    return this.clientCredentialsProvider.authenticate(
      this.idmEduplacesStagingConfig.IDM_EDUPLACES_STAGING_TOKEN_ENDPOINT,
      this.idmEduplacesStagingConfig.IDM_EDUPLACES_STAGING_CLIENT_ID,
      this.idmEduplacesStagingConfig.IDM_EDUPLACES_STAGING_CLIENT_SECRET,
      'client_credentials',
      'urn:eduplaces:idm:v1:schools:read urn:eduplaces:idm:v1:groups:read urn:eduplaces:idm:v1:people:read',
    );
  }

  async getPersons(
    parameters: SchulconnexQueryParameters,
  ): Promise<AdapterGetPersonsReturnType> {
    const response = await this.schulconnexFetcher.fetchPersons(
      this.idmEduplacesStagingConfig.IDM_EDUPLACES_STAGING_API_ENDPOINT,
      parameters,
      await this.getAuthToken(),
    );

    return {
      idm: this.getIdentifier(),
      response: transformSchulconnexPersonsResponse(response),
    };
  }

  async getGroups(): Promise<AdapterGetGroupsReturnType> {
    const response = await this.schulconnexFetcher.fetchGroups(
      this.idmEduplacesStagingConfig.IDM_EDUPLACES_STAGING_API_ENDPOINT,
      await this.getAuthToken(),
    );

    return {
      idm: this.getIdentifier(),
      response: response,
    };
  }
}

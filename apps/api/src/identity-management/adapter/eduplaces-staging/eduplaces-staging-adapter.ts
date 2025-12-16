import {
  AdapterGetGroupsReturnType,
  AdapterGetOrganizationsReturnType,
  AdapterGetPersonsReturnType,
  AdapterInterface,
} from '../adapter-interface';
import { Inject, Injectable } from '@nestjs/common';
import { SchulconnexFetcher } from '../../fetcher/schulconnex/schulconnex.fetcher';
import { SchulconnexPersonsQueryParameters } from '../../../controller/parameters/schulconnex-persons-query-parameters';
import { transformSchulconnexPersonsResponse } from '../../fetcher/schulconnex/schulconnex.transformer';
import { ClientCredentialsProvider } from '../../authentication/client-credentials';
import idmEduplacesStagingConfig, {
  type EduplacesStagingConfig,
} from '../../config/idm.eduplaces-staging.config';
import { BearerToken } from '../../authentication/bearer-token';
import { SchulconnexOrganizationQueryParameters } from '../../../controller/parameters/schulconnex-organisations-query-parameters';
import type { Clearance } from '../../../clearance/entity/clearance.entity';

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

  isEnabled(): boolean {
    return (
      this.idmEduplacesStagingConfig.IDM_EDUPLACES_STAGING_ENABLED ?? false
    );
  }

  private async getAuthToken(): Promise<BearerToken> {
    if (!this.idmEduplacesStagingConfig.IDM_EDUPLACES_STAGING_ENABLED) {
      throw new Error('Eduplaces Staging IDM is not enabled');
    }
    return this.clientCredentialsProvider.authenticate(
      this.idmEduplacesStagingConfig.IDM_EDUPLACES_STAGING_TOKEN_ENDPOINT,
      this.idmEduplacesStagingConfig.IDM_EDUPLACES_STAGING_CLIENT_ID,
      this.idmEduplacesStagingConfig.IDM_EDUPLACES_STAGING_CLIENT_SECRET,
      'client_credentials',
      'urn:eduplaces:idm:v1:schools:read urn:eduplaces:idm:v1:groups:read urn:eduplaces:idm:v1:people:read',
    );
  }

  async getPersons(
    parameters: SchulconnexPersonsQueryParameters,
    clearance?: Clearance[],
  ): Promise<AdapterGetPersonsReturnType> {
    void clearance;
    if (!this.idmEduplacesStagingConfig.IDM_EDUPLACES_STAGING_ENABLED) {
      throw new Error('Eduplaces Staging IDM is not enabled');
    }

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

  async getOrganizations(
    parameters: SchulconnexOrganizationQueryParameters,
  ): Promise<AdapterGetOrganizationsReturnType> {
    // @todo: Implement!
    void parameters;
    return new Promise(() => {
      return {
        idm: this.getIdentifier(),
        response: null,
      };
    });
  }

  async getGroups(schoolIds?: string[]): Promise<AdapterGetGroupsReturnType> {
    void schoolIds;
    if (!this.idmEduplacesStagingConfig.IDM_EDUPLACES_STAGING_ENABLED) {
      throw new Error('Eduplaces Staging IDM is not enabled');
    }

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

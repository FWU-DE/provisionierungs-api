import { Inject, Injectable } from '@nestjs/common';

import type { GroupClearance } from '../../../clearance/entity/group-clearance.entity';
import { SchoolClearance } from '../../../clearance/entity/school-clearance.entity';
import { SchulconnexOrganizationQueryParameters } from '../../../controller/parameters/schulconnex-organisations-query-parameters';
import { SchulconnexPersonsQueryParameters } from '../../../controller/parameters/schulconnex-persons-query-parameters';
import { BearerToken } from '../../authentication/bearer-token';
import { ClientCredentialsProvider } from '../../authentication/client-credentials';
import idmEduplacesStagingConfig, {
  type EduplacesStagingConfig,
} from '../../config/idm.eduplaces-staging.config';
import { SchulconnexFetcher } from '../../fetcher/schulconnex/schulconnex.fetcher';
import { transformSchulconnexPersonsResponse } from '../../fetcher/schulconnex/schulconnex.transformer';
import {
  AdapterGetGroupsReturnType,
  AdapterGetOrganizationsReturnType,
  AdapterGetPersonsReturnType,
  AdapterInterface,
} from '../adapter-interface';

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
    return this.idmEduplacesStagingConfig.IDM_EDUPLACES_STAGING_ENABLED
      ? this.idmEduplacesStagingConfig.IDM_EDUPLACES_STAGING_IDENTIFIER
      : 'eduplaces-staging';
  }

  isEnabled(): boolean {
    return this.idmEduplacesStagingConfig.IDM_EDUPLACES_STAGING_ENABLED ?? false;
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
    clientId?: string,
    groupClearances?: GroupClearance[],
    schoolClearance?: SchoolClearance[],
  ): Promise<AdapterGetPersonsReturnType> {
    void clientId;
    void groupClearances;
    void schoolClearance;
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
    clientId?: string,
  ): Promise<AdapterGetOrganizationsReturnType> {
    // @todo: Implement!
    void parameters;
    void clientId;
    return new Promise(() => {
      return {
        idm: this.getIdentifier(),
        response: null,
      };
    });
  }

  async getGroups(clientId?: string, schoolIds?: string[]): Promise<AdapterGetGroupsReturnType> {
    void clientId;
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

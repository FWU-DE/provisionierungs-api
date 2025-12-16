import { Inject, Injectable } from '@nestjs/common';

import type { Clearance } from '../../../clearance/entity/clearance.entity';
import { SchulconnexOrganizationQueryParameters } from '../../../controller/parameters/schulconnex-organisations-query-parameters';
import { SchulconnexPersonsQueryParameters } from '../../../controller/parameters/schulconnex-persons-query-parameters';
import { BearerToken } from '../../authentication/bearer-token';
import { ClientCredentialsProvider } from '../../authentication/client-credentials';
import idmBY_DE_vidis_idpConfig, {
  type DE_BY_vidis_idpConfig,
} from '../../config/idm.DE-BY-vidis-idp.config';
import { SchulconnexFetcher } from '../../fetcher/schulconnex/schulconnex.fetcher';
import { transformSchulconnexPersonsResponse } from '../../fetcher/schulconnex/schulconnex.transformer';
import {
  AdapterGetGroupsReturnType,
  AdapterGetOrganizationsReturnType,
  AdapterGetPersonsReturnType,
  AdapterInterface,
} from '../adapter-interface';

@Injectable()
export class DeByVidisIdpAdapter implements AdapterInterface {
  constructor(
    @Inject(idmBY_DE_vidis_idpConfig.KEY)
    private readonly idmBY_DE_vidis_idpConfig: DE_BY_vidis_idpConfig,
    @Inject(SchulconnexFetcher)
    private readonly schulconnexFetcher: SchulconnexFetcher,
    @Inject(ClientCredentialsProvider)
    private readonly clientCredentialsProvider: ClientCredentialsProvider,
  ) {}

  getIdentifier(): string {
    return 'DE-BY-vidis-idp';
  }

  isEnabled(): boolean {
    return this.idmBY_DE_vidis_idpConfig.IDM_DE_BY_VIDIS_IDP_ENABLED ?? false;
  }

  private async getAuthToken(): Promise<BearerToken> {
    if (!this.idmBY_DE_vidis_idpConfig.IDM_DE_BY_VIDIS_IDP_ENABLED) {
      throw new Error('DE-BY vidis idp IDM is not enabled');
    }
    return this.clientCredentialsProvider.authenticate(
      this.idmBY_DE_vidis_idpConfig.IDM_DE_BY_VIDIS_IDP_TOKEN_ENDPOINT,
      this.idmBY_DE_vidis_idpConfig.IDM_DE_BY_VIDIS_IDP_CLIENT_ID,
      this.idmBY_DE_vidis_idpConfig.IDM_DE_BY_VIDIS_IDP_CLIENT_SECRET,
      'client_credentials',
      'urn:eduplaces:idm:v1:schools:read urn:eduplaces:idm:v1:groups:read urn:eduplaces:idm:v1:people:read',
    );
  }

  async getPersons(
    parameters: SchulconnexPersonsQueryParameters,
    clearance?: Clearance[],
  ): Promise<AdapterGetPersonsReturnType> {
    void clearance;
    if (!this.idmBY_DE_vidis_idpConfig.IDM_DE_BY_VIDIS_IDP_ENABLED) {
      throw new Error('DE-BY vidis idp IDM is not enabled');
    }

    const response = await this.schulconnexFetcher.fetchPersons(
      this.idmBY_DE_vidis_idpConfig.IDM_DE_BY_VIDIS_IDP_API_ENDPOINT,
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
    if (!this.idmBY_DE_vidis_idpConfig.IDM_DE_BY_VIDIS_IDP_ENABLED) {
      throw new Error('DE-BY vidis idp IDM is not enabled');
    }

    const response = await this.schulconnexFetcher.fetchGroups(
      this.idmBY_DE_vidis_idpConfig.IDM_DE_BY_VIDIS_IDP_API_ENDPOINT,
      await this.getAuthToken(),
    );

    return {
      idm: this.getIdentifier(),
      response: response,
    };
  }
}

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
import idmBY_DE_vidis_idpConfig, {
  type DE_BY_vidis_idpConfig,
} from '../../config/idm.DE-BY-vidis-idp.config';
import { BearerToken } from '../../authentication/bearer-token';

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

  private async getAuthToken(): Promise<BearerToken> {
    return this.clientCredentialsProvider.authenticate(
      this.idmBY_DE_vidis_idpConfig.IDM_DE_BY_VIDIS_IDP_TOKEN_ENDPOINT,
      this.idmBY_DE_vidis_idpConfig.IDM_DE_BY_VIDIS_IDP_CLIENT_ID,
      this.idmBY_DE_vidis_idpConfig.IDM_DE_BY_VIDIS_IDP_CLIENT_SECRET,
      'client_credentials',
      'urn:eduplaces:idm:v1:schools:read urn:eduplaces:idm:v1:groups:read urn:eduplaces:idm:v1:people:read',
    );
  }

  async getPersons(
    parameters: SchulconnexQueryParameters,
  ): Promise<AdapterGetPersonsReturnType> {
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

  async getGroups(): Promise<AdapterGetGroupsReturnType> {
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

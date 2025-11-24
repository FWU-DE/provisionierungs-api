import {
  AdapterGetGroupsReturnType,
  AdapterGetPersonsReturnType,
  AdapterInterface,
} from '../adapter-interface';
import { Inject, Injectable } from '@nestjs/common';
import idmEduplacesConfig, {
  type EduplacesConfig,
} from '../../config/idm.eduplaces.config';
import { SchulconnexFetcher } from '../../fetcher/schulconnex/schulconnex.fetcher';
import { SchulconnexQueryParameters } from '../../../controller/parameters/schulconnex-query-parameters';
import { transformSchulconnexPersonsResponse } from '../../fetcher/schulconnex/schulconnex.transformer';
import { ClientCredentialsProvider } from '../../authentication/client-credentials';
import { BearerToken } from '../../authentication/bearer-token';

@Injectable()
export class EduplacesAdapter implements AdapterInterface {
  constructor(
    @Inject(idmEduplacesConfig.KEY)
    private readonly idmEduplacesConfig: EduplacesConfig,
    @Inject(SchulconnexFetcher)
    private readonly schulconnexFetcher: SchulconnexFetcher,
    @Inject(ClientCredentialsProvider)
    private readonly clientCredentialsProvider: ClientCredentialsProvider,
  ) {}

  getIdentifier(): string {
    return 'eduplaces';
  }

  private async getAuthToken(): Promise<BearerToken> {
    return this.clientCredentialsProvider.authenticate(
      this.idmEduplacesConfig.IDM_EDUPLACES_TOKEN_ENDPOINT,
      this.idmEduplacesConfig.IDM_EDUPLACES_CLIENT_ID,
      this.idmEduplacesConfig.IDM_EDUPLACES_CLIENT_SECRET,
      'client_credentials',
      'urn:eduplaces:idm:v1:schools:read urn:eduplaces:idm:v1:groups:read urn:eduplaces:idm:v1:people:read',
    );
  }

  async getPersons(
    parameters: SchulconnexQueryParameters,
  ): Promise<AdapterGetPersonsReturnType> {
    const response = await this.schulconnexFetcher.fetchPersons(
      this.idmEduplacesConfig.IDM_EDUPLACES_API_ENDPOINT,
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
      this.idmEduplacesConfig.IDM_EDUPLACES_API_ENDPOINT,
      await this.getAuthToken(),
    );

    return {
      idm: this.getIdentifier(),
      response: response,
    };
  }
}

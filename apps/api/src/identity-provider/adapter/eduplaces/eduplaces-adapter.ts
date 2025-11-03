import {
  AdapterGetGroupsReturnType,
  AdapterGetPersonsReturnType,
  AdapterInterface,
} from '../adapter-interface';
import { Inject, Injectable } from '@nestjs/common';
import idpEduplacesConfig, {
  type EduplacesConfig,
} from '../../../config/idp.eduplaces.config';
import { SchulconnexFetcher } from '../../fetcher/schulconnex/schulconnex.fetcher';
import { SchulconnexQueryParameters } from '../../../controller/parameters/schulconnex-query-parameters';
import { transformSchulconnexPersonsResponse } from '../../fetcher/schulconnex/schulconnex.transformer';
import { ClientCredentialsProvider } from '../../authentication/client-credentials';
import { BearerToken } from '../../authentication/bearer-token';

@Injectable()
export class EduplacesAdapter implements AdapterInterface {
  constructor(
    @Inject(idpEduplacesConfig.KEY)
    private readonly idpEduplacesConfig: EduplacesConfig,
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
      this.idpEduplacesConfig.IDP_EDUPLACES_TOKEN_ENDPOINT,
      this.idpEduplacesConfig.IDP_EDUPLACES_CLIENT_ID,
      this.idpEduplacesConfig.IDP_EDUPLACES_CLIENT_SECRET,
      'client_credentials',
      'urn:eduplaces:idm:v1:schools:read urn:eduplaces:idm:v1:groups:read urn:eduplaces:idm:v1:people:read',
    );
  }

  async getPersons(
    parameters: SchulconnexQueryParameters,
  ): Promise<AdapterGetPersonsReturnType> {
    const response = await this.schulconnexFetcher.fetchPersons(
      this.idpEduplacesConfig.IDP_EDUPLACES_API_ENDPOINT,
      parameters,
      await this.getAuthToken(),
    );

    return {
      idp: this.getIdentifier(),
      response: transformSchulconnexPersonsResponse(response),
    };
  }

  async getGroups(): Promise<AdapterGetGroupsReturnType> {
    const response = await this.schulconnexFetcher.fetchGroups(
      this.idpEduplacesConfig.IDP_EDUPLACES_API_ENDPOINT,
      await this.getAuthToken(),
    );

    return {
      idp: this.getIdentifier(),
      response: response,
    };
  }
}

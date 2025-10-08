import {
  AdapterGetPersonsReturnType,
  AdapterInterface,
} from '../adapter-interface';
import { Inject, Injectable } from '@nestjs/common';
import idpEduplacesConfig, {
  type EduplacesConfig,
} from '../../../config/idp.eduplaces.config';
import { SchulconnexFetcher } from '../../fetcher/schulconnex/schulconnex.fetcher';
import { SchulconnexQueryParameters } from '../../../controller/types/schulconnex';
import { transformSchulconnexResponse } from '../../fetcher/schulconnex/schulconnex.transformer';
import { ClientCredentialsProvider } from '../../authentication/client-credentials';

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

  async getPersons(
    parameters: SchulconnexQueryParameters,
  ): AdapterGetPersonsReturnType {
    const authToken = await this.clientCredentialsProvider.authenticate(
      this.idpEduplacesConfig.IDP_EDUPLACES_TOKEN_ENDPOINT,
      this.idpEduplacesConfig.IDP_EDUPLACES_CLIENT_ID,
      this.idpEduplacesConfig.IDP_EDUPLACES_CLIENT_SECRET,
      'client_credentials',
      'urn:eduplaces:idm:v1:schools:read urn:eduplaces:idm:v1:groups:read urn:eduplaces:idm:v1:people:read',
    );

    const response = await this.schulconnexFetcher.fetchPersons(
      this.idpEduplacesConfig.IDP_EDUPLACES_API_ENDPOINT,
      parameters,
      authToken,
    );

    return {
      idp: this.getIdentifier(),
      response: transformSchulconnexResponse(response),
    };
  }
}

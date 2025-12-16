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
import idmSaarlandConfig, {
  type SaarlandConfig,
} from '../../config/idm.saarland.config';
import { BearerToken } from '../../authentication/bearer-token';
import { FormUrlEncodedProvider } from '../../authentication/form-url-encoded';
import { SchulconnexOrganizationQueryParameters } from '../../../controller/parameters/schulconnex-organisations-query-parameters';
import type { Clearance } from '../../../clearance/entity/clearance.entity';
import { SchulconnexOrganization } from '../../dto/schulconnex/schulconnex-organization.dto';

@Injectable()
export class SaarlandAdapter implements AdapterInterface {
  constructor(
    @Inject(idmSaarlandConfig.KEY)
    private readonly idmSaarlandConfig: SaarlandConfig,
    @Inject(SchulconnexFetcher)
    private readonly schulconnexFetcher: SchulconnexFetcher,
    @Inject(FormUrlEncodedProvider)
    private readonly formUrlEncodedProvider: FormUrlEncodedProvider,
  ) {}

  getIdentifier(): string {
    return 'saarland';
  }

  private async getAuthToken(): Promise<BearerToken> {
    return this.formUrlEncodedProvider.authenticate(
      this.idmSaarlandConfig.IDM_SAARLAND_TOKEN_ENDPOINT,
      this.idmSaarlandConfig.IDM_SAARLAND_CLIENT_ID,
      this.idmSaarlandConfig.IDM_SAARLAND_CLIENT_SECRET,
      'client_credentials',
      this.idmSaarlandConfig.IDM_SAARLAND_SCOPE,
      this.idmSaarlandConfig.IDM_SAARLAND_RESOURCE,
    );
  }

  async getPersons(
    parameters: SchulconnexPersonsQueryParameters,
    clearance?: Clearance[],
  ): Promise<AdapterGetPersonsReturnType> {
    // Get organizations per schulkennung from clearance.
    const schoolIds = clearance?.map((clearance) => clearance.schoolId) ?? [];

    const availableOrganizations: AdapterGetOrganizationsReturnType =
      await this.getOrganizations(new SchulconnexOrganizationQueryParameters());

    const organizationIds = (availableOrganizations.response ?? [])
      .filter(
        (organizationResponse: SchulconnexOrganization) =>
          organizationResponse.kennung &&
          schoolIds.includes(organizationResponse.kennung),
      )
      .map((organization) => organization.id);

    // Fetch persons per retrieved organization
    const rawPersons = await Promise.all(
      organizationIds.map(async (organizationId) => {
        const localParameters = parameters.clone();
        localParameters['organisation.id'] = organizationId;

        return await this.schulconnexFetcher.fetchPersons(
          this.idmSaarlandConfig.IDM_SAARLAND_API_ENDPOINT,
          localParameters,
          await this.getAuthToken(),
        );
      }),
    );

    // Get the unique associated persons
    const response = [
      ...new Set(rawPersons.filter((person) => person !== null).flat()),
    ];

    return {
      idm: this.getIdentifier(),
      response: transformSchulconnexPersonsResponse(response),
    };
  }

  async getOrganizations(
    parameters: SchulconnexOrganizationQueryParameters,
  ): Promise<AdapterGetOrganizationsReturnType> {
    const response = await this.schulconnexFetcher.fetchOrganizations(
      this.idmSaarlandConfig.IDM_SAARLAND_API_ENDPOINT,
      parameters,
      await this.getAuthToken(),
    );

    return {
      idm: this.getIdentifier(),
      response: response,
    };
  }

  async getGroups(schoolIds?: string[]): Promise<AdapterGetGroupsReturnType> {
    let organizationIds: string[] | undefined;
    if (schoolIds) {
      const organizations = await this.getOrganizations(
        new SchulconnexOrganizationQueryParameters(),
      );
      organizationIds = organizations.response
        ?.filter(
          (organization) =>
            organization.kennung && schoolIds.includes(organization.kennung),
        )
        .map((organization) => organization.id);
    }

    const responses = await Promise.all(
      organizationIds?.map(async (organizationId) => {
        return await this.schulconnexFetcher.fetchGroups(
          this.idmSaarlandConfig.IDM_SAARLAND_API_ENDPOINT,
          await this.getAuthToken(),
          organizationId,
        );
      }) ?? [],
    );

    return {
      idm: this.getIdentifier(),
      response: responses.flat(),
    };
  }
}

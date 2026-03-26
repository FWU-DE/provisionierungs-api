import { Inject, Injectable } from '@nestjs/common';

import type { GroupClearance } from '../../../clearance/entity/group-clearance.entity';
import { SchoolClearance } from '../../../clearance/entity/school-clearance.entity';
import { SchulconnexOrganizationQueryParameters } from '../../../controller/parameters/schulconnex-organisations-query-parameters';
import { SchulconnexPersonsQueryParameters } from '../../../controller/parameters/schulconnex-persons-query-parameters';
import { BearerToken } from '../../authentication/bearer-token';
import { FormUrlEncodedProvider } from '../../authentication/form-url-encoded';
import idmSaarlandConfig, { type SaarlandConfig } from '../../config/idm.saarland.config';
import { SchulconnexOrganization } from '../../dto/schulconnex/schulconnex-organization.dto';
import { SchulconnexFetcher } from '../../fetcher/schulconnex/schulconnex.fetcher';
import { transformSchulconnexPersonsResponse } from '../../fetcher/schulconnex/schulconnex.transformer';
import {
  AdapterGetGroupsReturnType,
  AdapterGetOrganizationsReturnType,
  AdapterGetPersonsReturnType,
  AdapterInterface,
} from '../adapter-interface';

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
    // @todo: Change to production identifier after implementation. Or make this identifier configurable.
    return 'DE-SL-OnlineSchuleSaarlandTest';
  }

  isEnabled(): boolean {
    return this.idmSaarlandConfig.IDM_SAARLAND_ENABLED;
  }

  private async getAuthToken(): Promise<BearerToken> {
    if (!this.idmSaarlandConfig.IDM_SAARLAND_ENABLED) {
      throw new Error('Saarland IDM is not enabled');
    }

    return this.formUrlEncodedProvider.authenticate(
      this.idmSaarlandConfig.IDM_SAARLAND_TOKEN_ENDPOINT,
      this.idmSaarlandConfig.IDM_SAARLAND_CLIENT_ID,
      this.idmSaarlandConfig.IDM_SAARLAND_CLIENT_SECRET,
      'client_credentials',
      this.idmSaarlandConfig.IDM_SAARLAND_SCOPE,
      this.idmSaarlandConfig.IDM_SAARLAND_RESOURCE,
    );
  }

  /*
   * The prefix of the "kennung" of an organization
   *
   * This prefix is required as there is a difference in the formatting of the "kennung" between
   * the "schulkennung" in a user's JWT and the "kennung" on an organization returned from the Saarland IDM.
   * The JWT will contain the "DE-SL-" prefix, while the IDM will return the "SL_" prefix.
   * To allow matching between the two formats, the prefix is converted to match the JWT format.
   * The JWT format was chosen as it is the more reasonable format, matching the IDM's ID formatting.
   */
  getSchoolIdPrefix(): string {
    return 'DE-SL-';
  }

  private adjustOrganizationPrefix(schoolId: string | null | undefined): string | null | undefined {
    if (!schoolId) {
      return schoolId;
    }

    const parts = schoolId.split('_');
    const lastPart = parts[parts.length - 1];

    return `${this.getSchoolIdPrefix()}${lastPart}`;
  }

  private convertSchoolIdPrefixToIDMExpectation(
    schoolId: string | null | undefined,
  ): string | null | undefined {
    if (!schoolId) {
      return schoolId;
    }

    const parts = schoolId.split('-');
    // @todo: Remove the "SL_" part as soon as the prefix got removed in the Saarland IDM data.
    return 'SL_' + parts[parts.length - 1];
  }

  async getPersons(
    parameters: SchulconnexPersonsQueryParameters,
    clientId: string,
    groupClearances?: GroupClearance[],
    schoolClearance?: SchoolClearance[],
  ): Promise<AdapterGetPersonsReturnType> {
    const config = this.idmSaarlandConfig;
    if (!config.IDM_SAARLAND_ENABLED) {
      throw new Error('Saarland IDM is not enabled');
    }

    // Get organizations per schulkennung from clearance.
    const schoolIds = [
      ...(groupClearances?.map((clearance) => clearance.schoolId) ?? []),
      ...(schoolClearance?.map((clearance) => clearance.schoolId) ?? []),
    ];

    const availableOrganizations: AdapterGetOrganizationsReturnType = await this.getOrganizations(
      new SchulconnexOrganizationQueryParameters(),
      clientId,
    );

    const organizationIds = (availableOrganizations.response ?? [])
      .filter(
        (organizationResponse: SchulconnexOrganization) =>
          organizationResponse.kennung && schoolIds.includes(organizationResponse.kennung),
      )
      .map((organization) => organization.id);

    // Fetch persons per retrieved organization
    const rawPersons = await Promise.all(
      organizationIds.map(async (organizationId) => {
        const localParameters = parameters.clone();
        localParameters['organisation.id'] = organizationId;

        return await this.schulconnexFetcher.fetchPersons(
          config.IDM_SAARLAND_API_ENDPOINT,
          localParameters,
          await this.getAuthToken(),
          {
            'X-VIDIS-CLIENT-ID': clientId,
          },
        );
      }),
    );

    // Get the unique associated persons
    const response = [...new Set(rawPersons.filter((person) => person !== null).flat())];

    const transformedResponse = transformSchulconnexPersonsResponse(response);
    transformedResponse.forEach((personResponse) => {
      personResponse.personenkontexte?.forEach((context) => {
        if (context.organisation) {
          context.organisation.kennung = this.adjustOrganizationPrefix(
            context.organisation.kennung,
          );
        }
      });
    });

    return {
      idm: this.getIdentifier(),
      response: transformedResponse,
    };
  }

  async getOrganizations(
    parameters: SchulconnexOrganizationQueryParameters,
    clientId: string,
  ): Promise<AdapterGetOrganizationsReturnType> {
    if (!this.idmSaarlandConfig.IDM_SAARLAND_ENABLED) {
      throw new Error('Saarland IDM is not enabled');
    }

    if (parameters.kennung) {
      parameters.kennung =
        this.convertSchoolIdPrefixToIDMExpectation(parameters.kennung) ?? undefined;
    }

    const response = await this.schulconnexFetcher.fetchOrganizations(
      this.idmSaarlandConfig.IDM_SAARLAND_API_ENDPOINT,
      parameters,
      await this.getAuthToken(),
      {
        'X-VIDIS-CLIENT-ID': clientId,
      },
    );

    (response ?? []).forEach((organization) => {
      organization.kennung = this.adjustOrganizationPrefix(organization.kennung);
    });

    return {
      idm: this.getIdentifier(),
      response: response,
    };
  }

  async getGroups(clientId: string, schoolIds?: string[]): Promise<AdapterGetGroupsReturnType> {
    const config = this.idmSaarlandConfig;
    if (!config.IDM_SAARLAND_ENABLED) {
      throw new Error('Saarland IDM is not enabled');
    }

    let organizationIds: string[] | undefined;
    if (schoolIds) {
      const organizations = await this.getOrganizations(
        new SchulconnexOrganizationQueryParameters(),
        clientId,
      );
      organizationIds = organizations.response
        ?.filter((organization) => organization.kennung && schoolIds.includes(organization.kennung))
        .map((organization) => organization.id);
    }

    const responses = await Promise.all(
      organizationIds?.map(async (organizationId) => {
        return await this.schulconnexFetcher.fetchGroups(
          config.IDM_SAARLAND_API_ENDPOINT,
          await this.getAuthToken(),
          organizationId,
          {
            'X-VIDIS-CLIENT-ID': clientId,
          },
        );
      }) ?? [],
    );

    return {
      idm: this.getIdentifier(),
      response: responses.flat(),
    };
  }
}

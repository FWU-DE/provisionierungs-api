import { AbstractFetcher } from '../abstract-fetcher';
import { Injectable } from '@nestjs/common';
import { SchulconnexPersonsQueryParameters } from '../../../controller/parameters/schulconnex-persons-query-parameters';
import { SchulconnexPersonsResponse } from './schulconnex-response.interface';
import {
  schulconnexOrganizationsResponseSchema,
  schulconnexPersonsResponseSchema,
} from './schulconnex.validator';
import { BearerToken } from '../../authentication/bearer-token';
import type { ZodArray, ZodObject } from 'zod';
import { SchulconnexGroup } from '../../dto/schulconnex/schulconnex-group.dto';
import { ensureError } from '@fwu-rostering/utils/error';
import { SchulconnexOrganization } from '../../dto/schulconnex/schulconnex-organization.dto';
import { SchulconnexOrganizationQueryParameters } from '../../../controller/parameters/schulconnex-organisations-query-parameters';

@Injectable()
export class SchulconnexFetcher extends AbstractFetcher<BearerToken> {
  public async fetchPersons(
    endpointUrl: string,
    parameters: SchulconnexPersonsQueryParameters,
    { token }: BearerToken,
  ): Promise<null | SchulconnexPersonsResponse[]> {
    // Always include "personenkontexte" in the query parameters.
    // This is required to get group information for clearance filtration.
    const queryParams = parameters.clone();
    queryParams.vollstaendig.add('personenkontexte');

    // Make sure the right data is included to filter by ID.
    if (parameters['personenkontext.id']) {
      queryParams.vollstaendig.add('personenkontexte');
    }
    if (parameters['organisation.id']) {
      queryParams.vollstaendig.add('personenkontexte');
      queryParams.vollstaendig.add('personen');
      queryParams.vollstaendig.add('organisationen');
    }
    if (parameters['gruppe.id']) {
      queryParams.vollstaendig.add('personenkontexte');
      queryParams.vollstaendig.add('gruppen');
    }

    const fullEndpointUrl =
      endpointUrl + '/personen-info?' + queryParams.toUrlSearchParams();
    const response = await fetch(fullEndpointUrl, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + token,
      },
    });

    const data = await this.handleData<SchulconnexPersonsResponse[]>(
      response,
      fullEndpointUrl,
    );

    try {
      return this.validatePersonsData<SchulconnexPersonsResponse[]>(data);
    } catch (error: unknown) {
      this.logger.error(
        `Error while validating data fetched from ${endpointUrl}: ${ensureError(error).message}`,
      );
      return null;
    }
  }

  public async fetchOrganizations(
    endpointUrl: string,
    parameters: SchulconnexOrganizationQueryParameters,
    { token }: BearerToken,
  ): Promise<null | SchulconnexOrganization[]> {
    const queryParams = parameters.clone();

    const fullEndpointUrl =
      endpointUrl + '/organisationen-info?' + queryParams.toUrlSearchParams();
    const response = await fetch(fullEndpointUrl, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + token,
      },
    });

    const data = await this.handleData<SchulconnexOrganization[]>(
      response,
      fullEndpointUrl,
    );

    try {
      return this.validateOrganizationsData<SchulconnexOrganization[]>(data);
    } catch (error: unknown) {
      this.logger.error(
        `Error while validating data fetched from ${endpointUrl}: ${ensureError(error).message}`,
      );
      return null;
    }
  }

  public async fetchGroups(
    endpointUrl: string,
    bearerToken: BearerToken,
    organizationId?: string,
  ): Promise<SchulconnexGroup[]> {
    const personsQueryParameters = new SchulconnexPersonsQueryParameters(
      'personenkontexte,gruppen',
    );
    if (organizationId) {
      personsQueryParameters['organisation.id'] = organizationId;
    }

    const data: SchulconnexPersonsResponse[] | null = await this.fetchPersons(
      endpointUrl,
      personsQueryParameters,
      bearerToken,
    );
    if (!data) {
      return [];
    }

    // Gather all groups from all persons
    const groups: SchulconnexGroup[] = data
      .flatMap((person) => person.personenkontexte ?? [])
      .flatMap((context) => context.gruppen ?? [])
      .reduce<SchulconnexGroup[]>((acc, groupData) => {
        if (
          groupData.gruppe !== null &&
          typeof groupData.gruppe !== 'undefined'
        ) {
          acc.push(groupData.gruppe);
        }
        return acc;
      }, []);

    // Only get unique groups
    return groups.reduce<SchulconnexGroup[]>((acc, current) => {
      if (!acc.some((group) => group.id === current.id)) {
        acc.push(current);
      }
      return acc;
    }, []);
  }

  public getPersonsValidator(): ZodObject | ZodArray {
    return schulconnexPersonsResponseSchema;
  }

  public getOrganizationsValidator(): ZodObject | ZodArray {
    return schulconnexOrganizationsResponseSchema;
  }
}

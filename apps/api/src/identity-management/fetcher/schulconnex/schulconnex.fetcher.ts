import { AbstractFetcher } from '../abstract-fetcher';
import { Injectable } from '@nestjs/common';
import { SchulconnexQueryParameters } from '../../../controller/parameters/schulconnex-query-parameters';
import { SchulconnexPersonsResponse } from './schulconnex-response.interface';
import { schulconnexUsersResponseSchema } from './schulconnex.validator';
import { BearerToken } from '../../authentication/bearer-token';
import type { ZodArray, ZodObject } from 'zod';
import { SchulconnexGroup } from '../../dto/schulconnex/schulconnex-group.dto';
import { ensureError } from '@fwu-rostering/utils/error';

@Injectable()
export class SchulconnexFetcher extends AbstractFetcher<BearerToken> {
  public async fetchPersons(
    endpointUrl: string,
    parameters: SchulconnexQueryParameters,
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

    const response = await fetch(
      endpointUrl + '/personen-info?' + queryParams.toUrlSearchParams(),
      {
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + token,
        },
      },
    );

    const data = await this.handleData<SchulconnexPersonsResponse[]>(response);

    try {
      return this.validateData<SchulconnexPersonsResponse[]>(data);
    } catch (error: unknown) {
      ensureError(error);
      this.logger.error(
        `Error while validating data fetched from ${endpointUrl}: ${ensureError(error).message}`,
      );
      return null;
    }
  }

  public async fetchGroups(
    endpointUrl: string,
    bearerToken: BearerToken,
  ): Promise<SchulconnexGroup[]> {
    const data: SchulconnexPersonsResponse[] | null = await this.fetchPersons(
      endpointUrl,
      new SchulconnexQueryParameters('personenkontexte,gruppen'),
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

  public getValidator(): ZodObject | ZodArray {
    return schulconnexUsersResponseSchema;
  }
}

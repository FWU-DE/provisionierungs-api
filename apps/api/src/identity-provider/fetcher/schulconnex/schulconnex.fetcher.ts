import { AbstractFetcher } from '../abstract-fetcher';
import { Injectable } from '@nestjs/common';
import { SchulconnexQueryParameters } from '../../../controller/types/schulconnex';
import { SchulconnexResponse } from './schulconnex-response.interface';
import { schulconnexUsersResponseSchema } from './schulconnex.validator';
import { BearerToken } from '../../authentication/bearer-token';
import type { ZodArray, ZodObject } from 'zod';

@Injectable()
export class SchulconnexFetcher extends AbstractFetcher<BearerToken> {
  public async fetchPersons(
    endpointUrl: string,
    parameters: SchulconnexQueryParameters,
    { token }: BearerToken,
  ): Promise<null | SchulconnexResponse[]> {
    const response = await fetch(
      endpointUrl +
        '/personen-info?' +
        new URLSearchParams(parameters).toString(),
      {
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + token,
        },
      },
    );

    const data = await this.handleData<SchulconnexResponse[]>(response);
    return this.validateData<SchulconnexResponse[]>(data);
  }

  protected getValidator(): ZodObject | ZodArray {
    return schulconnexUsersResponseSchema;
  }
}

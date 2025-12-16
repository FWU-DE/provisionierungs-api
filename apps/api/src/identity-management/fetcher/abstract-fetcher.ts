import { Inject } from '@nestjs/common';
import type { ZodArray, ZodObject } from 'zod';

import { Logger } from '../../common/logger';
import { SchulconnexOrganizationQueryParameters } from '../../controller/parameters/schulconnex-organisations-query-parameters';
import { type SchulconnexPersonsQueryParameters } from '../../controller/parameters/schulconnex-persons-query-parameters';
import { BearerToken } from '../authentication/bearer-token';
import { SchulconnexGroup } from '../dto/schulconnex/schulconnex-group.dto';
import { SchulconnexOrganization } from '../dto/schulconnex/schulconnex-organization.dto';
import { type SchulconnexPersonsResponse } from './schulconnex/schulconnex-response.interface';

/**
 * Fetcher
 *
 * A Fetcher is responsible for fetching data from specific APIs (the IDMs).
 * Each fetcher should be implemented for a specific IDM API schema.
 *
 * This abstract class handles common tasks, like parsing the response and validating the data.
 * A fetcher class is to be used by Adapter classes.
 * A fetcher can be implemented for different credential types.
 */
export abstract class AbstractFetcher<Credentials> {
  constructor(
    @Inject(Logger)
    protected readonly logger: Logger,
  ) {}

  public abstract fetchPersons(
    endpointUrl: string,
    parameters: SchulconnexPersonsQueryParameters,
    credentials: Credentials,
  ): Promise<null | SchulconnexPersonsResponse[]>;

  public abstract fetchOrganizations(
    endpointUrl: string,
    parameters: SchulconnexOrganizationQueryParameters,
    { token }: BearerToken,
  ): Promise<null | SchulconnexOrganization[]>;

  public abstract fetchGroups(
    endpointUrl: string,
    credentials: Credentials,
  ): Promise<SchulconnexGroup[]>;

  public abstract getPersonsValidator(): ZodObject | ZodArray;
  public abstract getOrganizationsValidator(): ZodObject | ZodArray;

  /**
   * Common wrapper method to handle common request issues.
   */
  protected async handleData<T>(response: Response, endpointUrl?: string): Promise<T | null> {
    if (!response.ok) {
      this.logger.error(
        `Failed to fetch IDM data: ${String(response.status)} ${response.statusText} (${endpointUrl ?? 'unknown endpoint URL'})`,
      );
      this.logger.error(`Response: ${await response.text()}`);
      return null;
    }
    return (await response.json()) as T;
  }

  protected validatePersonsData<T>(data: T | null): T | null {
    const validator = this.getPersonsValidator();
    const { error, data: parsedData } = validator.safeParse(data);
    if (error) {
      throw new Error(`Schema Validation | IDM response is invalid: ${error.message}`);
    }
    return parsedData as T;
  }

  protected validateOrganizationsData<T>(data: T | null): T | null {
    const validator = this.getOrganizationsValidator();
    const { error, data: parsedData } = validator.safeParse(data);
    if (error) {
      throw new Error(`Schema Validation | IDM response is invalid: ${error.message}`);
    }
    return parsedData as T;
  }
}

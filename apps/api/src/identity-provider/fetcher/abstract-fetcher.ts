import type { ZodArray, ZodObject } from 'zod';
import { Logger } from '../../logger';
import { type SchulconnexPersonsResponse } from './schulconnex/schulconnex-response.interface';
import { type SchulconnexQueryParameters } from '../../controller/parameters/schulconnex-query-parameters';
import { Inject } from '@nestjs/common';
import { SchulconnexGroup } from '../../dto/schulconnex-group.dto';

/**
 * Fetcher
 *
 * A Fetcher is responsible for fetching data from specific APIs (the IdPs).
 * Each fetcher should be implemented for a specific IdP API schema.
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
    parameters: SchulconnexQueryParameters,
    credentials: Credentials,
  ): Promise<null | SchulconnexPersonsResponse[]>;

  public abstract fetchGroups(
    endpointUrl: string,
    credentials: Credentials,
  ): Promise<SchulconnexGroup[]>;

  public abstract getValidator(): ZodObject | ZodArray;

  /**
   * Common wrapper method to handle common request issues.
   */
  protected async handleData<T>(response: Response): Promise<T | null> {
    if (!response.ok) {
      this.logger.error(
        `Failed to fetch IdP data: ${String(response.status)} ${response.statusText}`,
      );
      this.logger.error(`Response: ${await response.text()}`);
      return null;
    }
    return (await response.json()) as T;
  }

  protected validateData<T>(data: T | null): T | null {
    const validator = this.getValidator();
    const { error, data: parsedData } = validator.safeParse(data);
    if (error) {
      throw new Error(
        `Schema Validation | IdP response is invalid: ${error.message}`,
      );
    }
    return parsedData as T;
  }
}

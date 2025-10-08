import type { ZodArray, ZodObject } from 'zod';
import { Logger } from '../../logger';
import { type SchulconnexResponse } from './schulconnex/schulconnex-response.interface';
import { type SchulconnexQueryParameters } from '../../controller/types/schulconnex';
import { Inject } from '@nestjs/common';

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
  ): Promise<null | SchulconnexResponse[]>;
  protected abstract getValidator(): ZodObject | ZodArray;

  /**
   * Common wrapper method to handle common request issues.
   */
  protected async handleData<T>(response: Response): Promise<T | null> {
    if (!response.ok) {
      this.logger.error(
        `Failed to fetch IDP data: ${String(response.status)} ${response.statusText}}`,
      );
      this.logger.error(`Response: ${await response.text()}`);
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data = await response.json();

    return data as T;
  }

  protected validateData<T>(data: T | null): T | null {
    const validator = this.getValidator();
    const { error, data: parsedData } = validator.safeParse(data);
    if (error) {
      this.logger.error(
        `Schema Validation | IDP response is invalid: ${error.message}`,
      );
      return null;
    }
    return parsedData as T;
  }
}

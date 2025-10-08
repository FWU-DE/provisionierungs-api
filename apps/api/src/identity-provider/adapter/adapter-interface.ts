import type { SchulconnexQueryParameters } from '../../controller/types/schulconnex';
import { type SchulconnexPersonsResponse } from '../../dto/schulconnex-persons-response.dto';

export type AdapterGetPersonsReturnType = Promise<{
  idp: string;
  response: SchulconnexPersonsResponse[] | null;
}>;

export interface AdapterInterface {
  getIdentifier(): string;

  getPersons(
    parameters: SchulconnexQueryParameters,
  ): AdapterGetPersonsReturnType;
}

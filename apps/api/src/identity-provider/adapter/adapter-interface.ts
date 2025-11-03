import type { SchulconnexQueryParameters } from '../../controller/parameters/schulconnex-query-parameters';
import { type SchulconnexPersonsResponse } from '../../dto/schulconnex-persons-response.dto';
import { type SchulconnexGroup } from '../../dto/schulconnex-group.dto';

export interface AdapterGetPersonsReturnType {
  idp: string;
  response: SchulconnexPersonsResponse[] | null;
}

export interface AdapterGetGroupsReturnType {
  idp: string;
  response: SchulconnexGroup[] | null;
}

export interface AdapterInterface {
  getIdentifier(): string;

  getPersons(
    parameters: SchulconnexQueryParameters,
  ): Promise<AdapterGetPersonsReturnType>;

  getGroups(): Promise<AdapterGetGroupsReturnType>;
}

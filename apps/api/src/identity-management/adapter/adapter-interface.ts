import type { SchulconnexQueryParameters } from '../../controller/parameters/schulconnex-query-parameters';
import { type SchulconnexPersonsResponse } from '../dto/schulconnex/schulconnex-persons-response.dto';
import { type SchulconnexGroup } from '../dto/schulconnex/schulconnex-group.dto';

export interface AdapterGetPersonsReturnType {
  idm: string;
  response: SchulconnexPersonsResponse[] | null;
}

export interface AdapterGetGroupsReturnType {
  idm: string;
  response: SchulconnexGroup[] | null;
}

export interface AdapterInterface {
  getIdentifier(): string;

  getPersons(
    parameters: SchulconnexQueryParameters,
  ): Promise<AdapterGetPersonsReturnType>;

  getGroups(): Promise<AdapterGetGroupsReturnType>;
}

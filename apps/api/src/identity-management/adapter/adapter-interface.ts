import type { SchulconnexPersonsQueryParameters } from '../../controller/parameters/schulconnex-persons-query-parameters';
import { type SchulconnexPersonsResponse } from '../dto/schulconnex/schulconnex-persons-response.dto';
import { type SchulconnexGroup } from '../dto/schulconnex/schulconnex-group.dto';
import { type SchulconnexOrganization } from '../dto/schulconnex/schulconnex-organization.dto';
import { type Clearance } from '../../clearance/entity/clearance.entity';
import { type SchulconnexOrganizationQueryParameters } from '../../controller/parameters/schulconnex-organisations-query-parameters';

export interface AdapterGetPersonsReturnType {
  idm: string;
  response: SchulconnexPersonsResponse[] | null;
}

export interface AdapterGetOrganizationsReturnType {
  idm: string;
  response: SchulconnexOrganization[] | null;
}

export interface AdapterGetGroupsReturnType {
  idm: string;
  response: SchulconnexGroup[] | null;
}

export interface AdapterInterface {
  getIdentifier(): string;

  isEnabled(): boolean;

  getPersons(
    parameters: SchulconnexPersonsQueryParameters,
    clearance?: Clearance[],
  ): Promise<AdapterGetPersonsReturnType>;

  getOrganizations(
    parameters: SchulconnexOrganizationQueryParameters,
  ): Promise<AdapterGetOrganizationsReturnType>;

  getGroups(schoolIds?: string[]): Promise<AdapterGetGroupsReturnType>;
}

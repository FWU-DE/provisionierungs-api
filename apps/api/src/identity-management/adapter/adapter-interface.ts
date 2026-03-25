import { type GroupClearance } from '../../clearance/entity/group-clearance.entity';
import type { SchoolClearance } from '../../clearance/entity/school-clearance.entity';
import { type SchulconnexOrganizationQueryParameters } from '../../controller/parameters/schulconnex-organisations-query-parameters';
import type { SchulconnexPersonsQueryParameters } from '../../controller/parameters/schulconnex-persons-query-parameters';
import { type SchulconnexGroup } from '../dto/schulconnex/schulconnex-group.dto';
import { type SchulconnexOrganization } from '../dto/schulconnex/schulconnex-organization.dto';
import { type SchulconnexPersonsResponseDto } from '../dto/schulconnex/schulconnex-persons-response.dto';

export interface AdapterGetPersonsReturnType {
  idm: string;
  response: SchulconnexPersonsResponseDto[] | null;
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
    groupClearance?: GroupClearance[],
    // @todo: Add test for the schoolClearance parameter (include in tests)!
    schoolClearance?: SchoolClearance[],
  ): Promise<AdapterGetPersonsReturnType>;

  getOrganizations(
    parameters: SchulconnexOrganizationQueryParameters,
  ): Promise<AdapterGetOrganizationsReturnType>;

  getGroups(schoolIds?: string[]): Promise<AdapterGetGroupsReturnType>;
}

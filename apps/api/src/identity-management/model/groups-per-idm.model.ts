import { type SchulconnexGroup } from '../dto/schulconnex/schulconnex-group.dto';

export class GroupsPerIdmModel {
  idm!: string;
  groups!: SchulconnexGroup[];
}

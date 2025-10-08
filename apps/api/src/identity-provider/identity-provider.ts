import type { SchulconnexPersonContext } from '../dto/schulconnex-person-context.dto';
import type { SchulconnexPerson } from '../dto/schulconnex-person.dto';

// @deprecated
export interface IdentityResult {
  pid: string;
  person?: SchulconnexPerson;
  personenkontexte?: SchulconnexPersonContext[];
}

import type { SchulconnexPerson } from '../../dto/schulconnex/schulconnex-person.dto';
import type { SchulconnexPersonContext } from '../../dto/schulconnex/schulconnex-person-context.dto';

export interface SchulconnexPersonsResponse {
  pid: string;
  // We do assumer that the input structure matches the schulconnex specification and therefore the DTO structure:
  person?: SchulconnexPerson;
  personenkontexte?: SchulconnexPersonContext[];
}

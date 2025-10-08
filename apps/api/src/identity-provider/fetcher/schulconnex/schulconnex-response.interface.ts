import type { SchulconnexPerson } from '../../../dto/schulconnex-person.dto';
import type { SchulconnexPersonContext } from '../../../dto/schulconnex-person-context.dto';

export interface SchulconnexResponse {
  pid: string;
  // We do assumer that the input structure matches the schulconnex specification and therefore the DTO structure:
  person: SchulconnexPerson;
  personenkontexte: SchulconnexPersonContext[];
}

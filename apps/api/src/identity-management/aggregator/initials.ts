import { plainToInstance } from 'class-transformer';

import { SchulconnexName } from '../dto/schulconnex/schulconnex-name.dto';
import type { SchulconnexPersonsResponseDto } from '../dto/schulconnex/schulconnex-persons-response.dto';

/**
 * Adds initials to persons missing them, based on their first and last names.
 */
export function applyMissingInitials(
  persons: SchulconnexPersonsResponseDto[],
): SchulconnexPersonsResponseDto[] {
  return persons.map((personResponse) => {
    const person = personResponse.person;
    if (!person) {
      return personResponse;
    }

    if (
      !person.name?.initialenfamilienname &&
      !person.name?.initialenvorname &&
      (person.name?.vorname || person.name?.familienname)
    ) {
      const firstName = person.name.vorname ?? null;
      const lastName = person.name.familienname ?? null;
      const initialsFirstName = firstName ? firstName.charAt(0).toUpperCase() : null;
      const initialsLastName = lastName ? lastName.charAt(0).toUpperCase() : null;

      person.name = plainToInstance(SchulconnexName, {
        // eslint-disable-next-line @typescript-eslint/no-misused-spread
        ...person.name,
        initialenvorname: initialsFirstName,
        initialenfamilienname: initialsLastName,
      });
    }

    return personResponse;
  });
}

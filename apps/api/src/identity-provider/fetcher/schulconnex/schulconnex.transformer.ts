import type { SchulconnexResponse } from './schulconnex-response.interface';
import { type SchulconnexPersonsResponse } from '../../../dto/schulconnex-persons-response.dto';

export function transformSchulconnexResponse(
  response: null | SchulconnexResponse[],
): SchulconnexPersonsResponse[] {
  // We do assumer that the input structure matches the schulconnex specification and therefore the DTO structure:
  return (response ?? []) as SchulconnexPersonsResponse[];
}

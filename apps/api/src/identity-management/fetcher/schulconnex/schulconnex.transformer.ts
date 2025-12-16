import { type SchulconnexPersonsResponse } from '../../dto/schulconnex/schulconnex-persons-response.dto';
import type { SchulconnexPersonsResponse as InboundSchulconnexPersonsResponse } from './schulconnex-response.interface';

export function transformSchulconnexPersonsResponse(
  response: null | InboundSchulconnexPersonsResponse[],
): SchulconnexPersonsResponse[] {
  // We do assumer that the input structure matches the schulconnex specification and therefore the DTO structure:
  return (response ?? []) as SchulconnexPersonsResponse[];
}

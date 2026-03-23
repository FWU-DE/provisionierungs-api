import { type SchulconnexPersonsResponseDto } from '../../dto/schulconnex/schulconnex-persons-response.dto';
import type { SchulconnexPersonsResponse as InboundSchulconnexPersonsResponse } from './schulconnex-response.interface';

export function transformSchulconnexPersonsResponse(
  response: null | InboundSchulconnexPersonsResponse[],
): SchulconnexPersonsResponseDto[] {
  // We do assumer that the input structure matches the schulconnex specification and therefore the DTO structure:
  return (response ?? []) as SchulconnexPersonsResponseDto[];
}

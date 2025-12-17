import { Inject, Injectable } from '@nestjs/common';

import { SchulconnexPersonContext } from '../identity-management/dto/schulconnex/schulconnex-person-context.dto';
import { type SchulconnexPersonsResponse } from '../identity-management/dto/schulconnex/schulconnex-persons-response.dto';
import { OfferContext } from '../offers/model/offer-context';
import pseudonymizationConfig, {
  type PseudonymizationConfig,
} from './config/pseudonymization.config';
import { Hasher } from './hasher';

/**
 * Pseudonymization
 *
 * @todo: Add a good description of the process, after the process is fully implemented.
 *
 * Note:  The pseudonymization could POTENTIALLY create duplicate UUIDs for different IDMs.
 */
@Injectable()
export class Pseudonymization {
  public constructor(
    @Inject(pseudonymizationConfig.KEY)
    private readonly pseudonymConfig: PseudonymizationConfig,
    private readonly hasher: Hasher,
  ) {}

  public async pseudonymize(
    offerContext: OfferContext,
    identities: SchulconnexPersonsResponse[],
  ): Promise<SchulconnexPersonsResponse[]> {
    const salt = await this.getSalt(offerContext.clientId);
    const sectorIdentifier = await this.getSectorIdentifier(offerContext.clientId);

    return await Promise.all(
      identities.map(
        async (identity: SchulconnexPersonsResponse): Promise<SchulconnexPersonsResponse> => {
          identity.pid = this.hasher.hash(identity.pid, salt, sectorIdentifier);

          if (identity.person?.stammorganisation?.id) {
            identity.person.stammorganisation.id = this.hasher.hash(
              identity.person.stammorganisation.id,
              salt,
              sectorIdentifier,
            );
          }

          identity.personenkontexte?.map(
            (personenkontext: SchulconnexPersonContext): SchulconnexPersonContext => {
              personenkontext.id = this.hasher.hash(personenkontext.id, salt, sectorIdentifier);

              return personenkontext;
            },
          );

          return Promise.resolve(identity);
        },
      ),
    );
  }

  private async getSalt(clientId?: string): Promise<string> {
    // @todo: Get salt for client via API
    void clientId;

    const saltEndpoint = this.pseudonymConfig.PSEUDONYMIZATION_SALT_ENDPOINT;
    void saltEndpoint;

    return Promise.resolve(this.pseudonymConfig.PSEUDONYMIZATION_SALT);
  }

  private async getSectorIdentifier(clientId?: string): Promise<string> {
    // @todo: Get sector identifier for client...
    void clientId;

    return Promise.resolve(this.pseudonymConfig.PSEUDONYMIZATION_SECTOR_IDENTIFIER);
  }
}

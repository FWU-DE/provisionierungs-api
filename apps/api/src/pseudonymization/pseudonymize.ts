import { Inject, Injectable } from '@nestjs/common';
import pseudonymizationConfig, {
  type PseudonymizationConfig,
} from '../config/pseudonymization.config';
import {
  PartialSchulconnexPersonContext,
  SchulconnexPersonContext,
} from '../dto/schulconnex-person-context.dto';
import { type SchulconnexPersonsResponse } from '../dto/schulconnex-persons-response.dto';
import { Hasher } from './hasher';

/**
 * @todo: Add a good description of the process.
 *
 * Note:  The pseudonymization could POTENTIALLY create duplicate UUIDs for different IdPs.
 */
@Injectable()
export class Pseudonymization {
  public constructor(
    @Inject(pseudonymizationConfig.KEY)
    private readonly pseudonymConfig: PseudonymizationConfig,
    private readonly hasher: Hasher,
  ) {}

  public async pseudonymize(
    clientId: string,
    identities: SchulconnexPersonsResponse[],
  ): Promise<SchulconnexPersonsResponse[]> {
    const salt = await this.getSalt(clientId);
    const sectorIdentifier = await this.getSectorIdentifier(clientId);

    return await Promise.all(
      identities.map(
        async (
          identity: SchulconnexPersonsResponse,
        ): Promise<SchulconnexPersonsResponse> => {
          identity.pid = this.hasher.hash(identity.pid, salt, sectorIdentifier);

          if (identity.person.stammorganisation?.id) {
            identity.person.stammorganisation.id = this.hasher.hash(
              identity.person.stammorganisation.id,
              salt,
              sectorIdentifier,
            );
          }

          identity.personenkontexte?.map(
            (
              personenkontext:
                | SchulconnexPersonContext
                | PartialSchulconnexPersonContext,
            ): SchulconnexPersonContext | PartialSchulconnexPersonContext => {
              personenkontext.id = this.hasher.hash(
                personenkontext.id,
                salt,
                sectorIdentifier,
              );

              return personenkontext;
            },
          );

          return Promise.resolve(identity);
        },
      ),
    );
  }

  private async getSalt(clientId: string): Promise<string> {
    // @todo: Get salt for client via API
    void clientId;

    const saltEndpoint = this.pseudonymConfig.PSEUDONYMIZATION_SALT_ENDPOINT;
    void saltEndpoint;

    return Promise.resolve('12345678');
  }

  private async getSectorIdentifier(clientId: string): Promise<string> {
    // @todo: Get sector identifier for client...
    void clientId;

    return Promise.resolve('https://sector.identifier');
  }
}

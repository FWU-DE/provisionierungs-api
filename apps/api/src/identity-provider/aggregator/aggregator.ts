import { Inject, Injectable } from '@nestjs/common';
import { SchulconnexQueryParameters } from '../../controller/types/schulconnex';
import { EduplacesAdapter } from '../adapter/eduplaces/eduplaces-adapter';
import {
  AdapterGetPersonsReturnType,
  AdapterInterface,
} from '../adapter/adapter-interface';
import { SchulconnexPersonsResponse } from '../../dto/schulconnex-persons-response.dto';
import { applyClearanceFilter } from '../../clearance/clearance.filter';
import { EduplacesStagingAdapter } from '../adapter/eduplaces-staging/eduplaces-staging-adapter';
import { Pseudonymization } from '../../pseudonymization/pseudonymize';
import { Logger } from '../../logger';

@Injectable()
export class Aggregator {
  constructor(
    private readonly eduplacesAdapter: EduplacesAdapter,
    private readonly eduplacesStagingAdapter: EduplacesStagingAdapter,
    @Inject(Pseudonymization)
    private readonly pseudonymization: Pseudonymization,
    private readonly logger: Logger,
  ) {}

  private getAvailableAdapters(): AdapterInterface[] {
    return [this.eduplacesAdapter, this.eduplacesStagingAdapter];
  }

  private getAdapterById(id: string): undefined | AdapterInterface {
    return this.getAvailableAdapters().find(
      (adapter) => adapter.getIdentifier() === id,
    );
  }

  public async getUsers(
    idpIds: string[],
    clientId: string,
    parameters: SchulconnexQueryParameters,
  ): Promise<SchulconnexPersonsResponse[]> {
    // Request data from all IdPs in parallel
    const idpRequests: Promise<AdapterGetPersonsReturnType>[] = [];
    idpIds.forEach((idpId) => {
      const adapter = this.getAdapterById(idpId);
      if (!adapter) {
        this.logger.error(`No adapter found for IdP: ${idpId}`);
        return [];
      }
      idpRequests.push(adapter.getPersons(parameters));
    });

    // Merge all responses into one array on retrieval
    const rawIdentities: SchulconnexPersonsResponse[] = (
      await Promise.all(idpRequests)
    ).reduce((acc: SchulconnexPersonsResponse[], identities) => {
      if (identities.response === null) {
        this.logger.error('No data received from IdP: ' + identities.idp);
        return acc;
      }
      return [...acc, ...identities.response];
    }, []);

    const filteredData = applyClearanceFilter(
      clientId,
      rawIdentities,
      parameters,
    );

    return this.pseudonymization.pseudonymize(clientId, filteredData);
  }
}

import { Inject, Injectable } from '@nestjs/common';

import { Clearance } from '../../clearance/entity/clearance.entity';
import { applyClearancePersonsFieldFilter } from '../../clearance/filter/clearance-field.filter';
import { applyClearancePersonsGroupFilter } from '../../clearance/filter/clearance-group.filter';
import { Logger } from '../../common/logger';
import { SchulconnexPersonsQueryParameters } from '../../controller/parameters/schulconnex-persons-query-parameters';
import { OfferContext } from '../../offers/model/offer-context';
import { Pseudonymization } from '../../pseudonymization/pseudonymization';
import { DeByVidisIdpAdapter } from '../adapter/DE-BY-vidis-idp/de-by-vidis-idp-adapter';
import {
  AdapterGetGroupsReturnType,
  AdapterGetPersonsReturnType,
  AdapterInterface,
} from '../adapter/adapter-interface';
import { EduplacesStagingAdapter } from '../adapter/eduplaces-staging/eduplaces-staging-adapter';
import { EduplacesAdapter } from '../adapter/eduplaces/eduplaces-adapter';
import { SaarlandAdapter } from '../adapter/saarland/saarland-adapter';
import { SchulconnexPersonsResponse } from '../dto/schulconnex/schulconnex-persons-response.dto';
import { GroupsPerIdmModel } from '../model/groups-per-idm.model';
import { PostRequestFilter } from '../post-request-filter/post-request-filter';

@Injectable()
export class Aggregator {
  constructor(
    private readonly deByVidisIdpAdapter: DeByVidisIdpAdapter,
    private readonly eduplacesAdapter: EduplacesAdapter,
    private readonly eduplacesStagingAdapter: EduplacesStagingAdapter,
    private readonly saarlandAdapter: SaarlandAdapter,
    @Inject(Pseudonymization)
    private readonly pseudonymization: Pseudonymization,
    private readonly logger: Logger,
    private readonly postRequestFilter: PostRequestFilter,
  ) {}

  private getAvailableAdapters(): AdapterInterface[] {
    const allAdapters: AdapterInterface[] = [
      this.deByVidisIdpAdapter,
      this.eduplacesAdapter,
      this.eduplacesStagingAdapter,
      this.saarlandAdapter,
    ];
    return allAdapters.filter((adapter) => {
      return adapter.isEnabled();
    });
  }

  private getAdapterById(id: string): undefined | AdapterInterface {
    return this.getAvailableAdapters().find((adapter) => adapter.getIdentifier() === id);
  }

  public async getPersons(
    idmIds: string[],
    offerContext: OfferContext,
    parameters: SchulconnexPersonsQueryParameters,
    clearance?: Clearance[],
  ): Promise<SchulconnexPersonsResponse[]> {
    // Request data from all IDMs in parallel
    const idmRequests: Promise<AdapterGetPersonsReturnType>[] = [];
    idmIds.forEach((idmId) => {
      const adapter = this.getAdapterById(idmId);
      if (!adapter) {
        this.logger.error(`No adapter found for IDM: ${idmId}`);
        return [];
      }
      idmRequests.push(adapter.getPersons(parameters, clearance));
    });

    // Merge all responses into one array on retrieval
    const rawPersons: SchulconnexPersonsResponse[] = (await Promise.all(idmRequests)).reduce(
      (acc: SchulconnexPersonsResponse[], person) => {
        if (person.response === null) {
          this.logger.error('No data received from IDM: ' + person.idm);
          return acc;
        }
        return [...acc, ...person.response];
      },
      [],
    );

    // Firstly, remove all entries the client does not have clearance for.
    const clearedDataByGroup = applyClearancePersonsGroupFilter(rawPersons, clearance);

    // Secondly, pseudonymize the data.
    const pseudonymizedData = await this.pseudonymization.pseudonymize(
      offerContext,
      clearedDataByGroup,
    );

    // Thirdly, filter the data by the clearance fields.
    const clearedDataByFields = applyClearancePersonsFieldFilter(
      offerContext.offerId,
      pseudonymizedData,
    );

    // Fourthly, filter the data by the query parameters.
    // That has to be done last, because the client might only ever know pseudonymized data,
    // and therefore, IDs in queries will always be pseudonymized.
    return this.postRequestFilter.filterByQueryParameters(clearedDataByFields, parameters);
  }

  public async getGroups(idmIds: string[], schoolIds?: string[]): Promise<GroupsPerIdmModel[]> {
    // Request data from all IDMs in parallel
    const idmRequests: Promise<AdapterGetGroupsReturnType>[] = [];
    idmIds.forEach((idmId) => {
      const adapter = this.getAdapterById(idmId);
      if (!adapter) {
        this.logger.error(`No adapter found for IDM: ${idmId}`);
        return [];
      }
      idmRequests.push(adapter.getGroups(schoolIds));
    });

    // Merge all responses into one array on retrieval
    return (await Promise.all(idmRequests)).reduce((acc: GroupsPerIdmModel[], groups) => {
      if (groups.response === null) {
        this.logger.error('No data received from IDM: ' + groups.idm);
        return acc;
      }
      return [
        ...acc,
        {
          idm: groups.idm,
          groups: groups.response,
        },
      ];
    }, []);
  }
}

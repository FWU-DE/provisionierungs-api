import { Inject, Injectable } from '@nestjs/common';
import { SchulconnexQueryParameters } from '../../controller/parameters/schulconnex-query-parameters';
import { EduplacesAdapter } from '../adapter/eduplaces/eduplaces-adapter';
import {
  AdapterGetGroupsReturnType,
  AdapterGetPersonsReturnType,
  AdapterInterface,
} from '../adapter/adapter-interface';
import { SchulconnexPersonsResponse } from '../dto/schulconnex/schulconnex-persons-response.dto';
import { EduplacesStagingAdapter } from '../adapter/eduplaces-staging/eduplaces-staging-adapter';
import { Pseudonymization } from '../../pseudonymization/pseudonymization';
import { Logger } from '../../common/logger';
import { GroupsPerIdmModel } from '../model/groups-per-idm.model';
import { applyClearancePersonsFieldFilter } from '../../clearance/filter/clearance-field.filter';
import { Clearance } from '../../clearance/entity/clearance.entity';
import { PostRequestFilter } from '../post-request-filter/post-request-filter';
import { applyClearancePersonsGroupFilter } from '../../clearance/filter/clearance-group.filter';
import { OfferContext } from '../../offers/model/offer-context';
import { DeByVidisIdpAdapter } from '../adapter/DE-BY-vidis-idp/de-by-vidis-idp-adapter';

@Injectable()
export class Aggregator {
  constructor(
    private readonly eduplacesAdapter: EduplacesAdapter,
    private readonly eduplacesStagingAdapter: EduplacesStagingAdapter,
    private readonly deByVidisIdpAdapter: DeByVidisIdpAdapter,
    @Inject(Pseudonymization)
    private readonly pseudonymization: Pseudonymization,
    private readonly logger: Logger,
    private readonly postRequestFilter: PostRequestFilter,
  ) {}

  private getAvailableAdapters(): AdapterInterface[] {
    return [
      this.eduplacesAdapter,
      this.eduplacesStagingAdapter,
      this.deByVidisIdpAdapter,
    ];
  }

  private getAdapterById(id: string): undefined | AdapterInterface {
    return this.getAvailableAdapters().find(
      (adapter) => adapter.getIdentifier() === id,
    );
  }

  public async getPersons(
    idmIds: string[],
    offerContext: OfferContext,
    parameters: SchulconnexQueryParameters,
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
      idmRequests.push(adapter.getPersons(parameters));
    });

    // Merge all responses into one array on retrieval
    const rawIdentities: SchulconnexPersonsResponse[] = (
      await Promise.all(idmRequests)
    ).reduce((acc: SchulconnexPersonsResponse[], identities) => {
      if (identities.response === null) {
        this.logger.error('No data received from IDM: ' + identities.idm);
        return acc;
      }
      return [...acc, ...identities.response];
    }, []);

    // Firstly, remove all entries the client does not have clearance for.
    const clearedDataByGroup = applyClearancePersonsGroupFilter(
      rawIdentities,
      clearance,
    );

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
    return this.postRequestFilter.filterByQueryParameters(
      clearedDataByFields,
      parameters,
    );
  }

  public async getGroups(idmIds: string[]): Promise<GroupsPerIdmModel[]> {
    // Request data from all IDMs in parallel
    const idmRequests: Promise<AdapterGetGroupsReturnType>[] = [];
    idmIds.forEach((idmId) => {
      const adapter = this.getAdapterById(idmId);
      if (!adapter) {
        this.logger.error(`No adapter found for IDM: ${idmId}`);
        return [];
      }
      idmRequests.push(adapter.getGroups());
    });

    // Merge all responses into one array on retrieval
    return (await Promise.all(idmRequests)).reduce(
      (acc: GroupsPerIdmModel[], groups) => {
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
      },
      [],
    );
  }
}

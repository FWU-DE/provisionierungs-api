import { Inject, Injectable } from '@nestjs/common';
import { SchulconnexQueryParameters } from '../../controller/parameters/schulconnex-query-parameters';
import { EduplacesAdapter } from '../adapter/eduplaces/eduplaces-adapter';
import {
  AdapterGetGroupsReturnType,
  AdapterGetPersonsReturnType,
  AdapterInterface,
} from '../adapter/adapter-interface';
import { SchulconnexPersonsResponse } from '../../dto/schulconnex-persons-response.dto';
import { EduplacesStagingAdapter } from '../adapter/eduplaces-staging/eduplaces-staging-adapter';
import { Pseudonymization } from '../../pseudonymization/pseudonymize';
import { Logger } from '../../logger';
import { ApiGroupsDto } from '../../dto/api.groups.dto';
import { applyClearancePersonsFieldFilter } from '../../clearance/clearance-field.filter';
import { Clearance } from '../../clearance/clearance.entity';
import { PostRequestFilter } from '../post-request-filter/post-request-filter';
import { applyClearancePersonsGroupFilter } from '../../clearance/clearance-group.filter';

@Injectable()
export class Aggregator {
  constructor(
    private readonly eduplacesAdapter: EduplacesAdapter,
    private readonly eduplacesStagingAdapter: EduplacesStagingAdapter,
    @Inject(Pseudonymization)
    private readonly pseudonymization: Pseudonymization,
    private readonly logger: Logger,
    private readonly postRequestFilter: PostRequestFilter,
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
    clearance?: Clearance[],
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

    // Firstly, remove all entries the client does not have clearance for.
    const clearedDataByGroup = applyClearancePersonsGroupFilter(
      rawIdentities,
      clearance,
    );

    // Secondly, pseudonymize the data.
    const pseudonymizedData = await this.pseudonymization.pseudonymize(
      clientId,
      clearedDataByGroup,
    );

    // Thirdly, filter the data by the clearance fields.
    const clearedDataByFields = applyClearancePersonsFieldFilter(
      clientId,
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

  public async getGroups(idpIds: string[]): Promise<ApiGroupsDto[]> {
    // Request data from all IdPs in parallel
    const idpRequests: Promise<AdapterGetGroupsReturnType>[] = [];
    idpIds.forEach((idpId) => {
      const adapter = this.getAdapterById(idpId);
      if (!adapter) {
        this.logger.error(`No adapter found for IdP: ${idpId}`);
        return [];
      }
      idpRequests.push(adapter.getGroups());
    });

    // Merge all responses into one array on retrieval
    return (await Promise.all(idpRequests)).reduce(
      (acc: ApiGroupsDto[], groups) => {
        if (groups.response === null) {
          this.logger.error('No data received from IdP: ' + groups.idp);
          return acc;
        }
        return [
          ...acc,
          {
            idp: groups.idp,
            groups: groups.response,
          },
        ];
      },
      [],
    );
  }
}

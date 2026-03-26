import { Inject, Injectable } from '@nestjs/common';

import { GroupClearance } from '../../clearance/entity/group-clearance.entity';
import { SchoolClearance } from '../../clearance/entity/school-clearance.entity';
import { applyClearancePersonsFieldFilter } from '../../clearance/filter/clearance-field.filter';
import { applyClearancePersonsGroupFilter } from '../../clearance/filter/clearance-group.filter';
import { applyClearancePersonsSchoolFilter } from '../../clearance/filter/clearance-school.filter';
import { Logger } from '../../common/logger';
import { SchulconnexOrganizationQueryParameters } from '../../controller/parameters/schulconnex-organisations-query-parameters';
import { SchulconnexPersonsQueryParameters } from '../../controller/parameters/schulconnex-persons-query-parameters';
import { OfferContext } from '../../offers/model/offer-context';
import { Pseudonymization } from '../../pseudonymization/pseudonymization';
import {
  AdapterGetGroupsReturnType,
  AdapterGetOrganizationsReturnType,
  AdapterGetPersonsReturnType,
  AdapterInterface,
} from '../adapter/adapter-interface';
import { EduplacesStagingAdapter } from '../adapter/eduplaces-staging/eduplaces-staging-adapter';
import { EduplacesAdapter } from '../adapter/eduplaces/eduplaces-adapter';
import { SaarlandAdapter } from '../adapter/saarland/saarland-adapter';
import { SchulconnexOrganization } from '../dto/schulconnex/schulconnex-organization.dto';
import { SchulconnexPersonsResponseDto } from '../dto/schulconnex/schulconnex-persons-response.dto';
import { GroupsPerIdmModel } from '../model/groups-per-idm.model';
import { PostRequestFilter } from '../post-request-filter/post-request-filter';
import { applyMissingInitials } from './initials';

@Injectable()
export class Aggregator {
  constructor(
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
    groupClearance?: GroupClearance[],
    schoolClearance?: SchoolClearance[],
  ): Promise<SchulconnexPersonsResponseDto[]> {
    // Request data from all IDMs in parallel
    const idmRequests: Promise<AdapterGetPersonsReturnType>[] = [];
    idmIds.forEach((idmId) => {
      const adapter = this.getAdapterById(idmId);
      if (!adapter) {
        this.logger.error(`No adapter found for IDM: ${idmId}`);
        return [];
      }

      idmRequests.push(
        adapter.getPersons(parameters, offerContext.clientId, groupClearance, schoolClearance),
      );
    });

    // Merge all responses into one array on retrieval
    const rawPersons: SchulconnexPersonsResponseDto[] = (await Promise.all(idmRequests)).reduce(
      (acc: SchulconnexPersonsResponseDto[], person) => {
        if (person.response === null) {
          this.logger.error('No data received from IDM: ' + person.idm);
          return acc;
        }
        return [...acc, ...person.response];
      },
      [],
    );

    // Firstly, remove all entries the client does not have clearance for.
    const mergedClearedData = this.applyPersonsClearance(
      rawPersons,
      groupClearance,
      schoolClearance,
    );

    // Secondly, pseudonymize the data.
    const pseudonymizedData = await this.pseudonymization.pseudonymize(
      offerContext,
      mergedClearedData,
    );
    // Add missing initials where necessary
    const additionalData = applyMissingInitials(pseudonymizedData);

    // Thirdly, filter the data by the clearance fields.
    const clearedDataByFields = applyClearancePersonsFieldFilter(
      offerContext.offerId,
      additionalData,
    );

    // Fourthly, filter the data by the query parameters.
    // That has to be done last, because the client might only ever know pseudonymized data,
    // and therefore, IDs in queries will always be pseudonymized.
    return this.postRequestFilter.filterByQueryParameters(clearedDataByFields, parameters);
  }

  private applyPersonsClearance(
    rawPersons: SchulconnexPersonsResponseDto[],
    groupClearance?: GroupClearance[],
    schoolClearance?: SchoolClearance[],
  ): SchulconnexPersonsResponseDto[] {
    // The school filter needs to be used before the group filter is applied.
    const clearedDataBySchool = applyClearancePersonsSchoolFilter(rawPersons, schoolClearance);

    // A new diff between the original entries and the result from the school filtration needs to be created.
    // The diff includes all entries that where not returned by the school filter.
    const schoolFilterDiff = rawPersons.filter((person) => !clearedDataBySchool.includes(person));

    // The diff will be provided as entries to the group filter.
    const clearedDataByGroup = applyClearancePersonsGroupFilter(schoolFilterDiff, groupClearance);

    // Now, the results from the school filter and the group filter get merged and are the actual filtered data.
    return [...clearedDataBySchool, ...clearedDataByGroup];
  }

  public async getOrganizations(
    idmIds: string[],
    clientId: string,
    parameters: SchulconnexOrganizationQueryParameters,
  ): Promise<SchulconnexOrganization[]> {
    // Request data from all IDMs in parallel
    const idmRequests: Promise<AdapterGetOrganizationsReturnType>[] = [];
    idmIds.forEach((idmId) => {
      const adapter = this.getAdapterById(idmId);
      if (!adapter) {
        this.logger.error(`No adapter found for IDM: ${idmId}`);
        return [];
      }
      idmRequests.push(adapter.getOrganizations(parameters, clientId));
    });

    // Merge all responses into one array on retrieval
    const rawOrganizations: SchulconnexOrganization[] = (await Promise.all(idmRequests)).reduce(
      (acc: SchulconnexOrganization[], prganization) => {
        if (prganization.response === null) {
          this.logger.error('No data received from IDM: ' + prganization.idm);
          return acc;
        }
        return [...acc, ...prganization.response];
      },
      [],
    );

    // @todo: Add organization level clearance.
    // @todo: Add pseudonymization.

    return rawOrganizations;
  }

  public async getGroups(
    idmIds: string[],
    clientId: string,
    schoolIds?: string[],
  ): Promise<GroupsPerIdmModel[]> {
    // Request data from all IDMs in parallel
    const idmRequests: Promise<AdapterGetGroupsReturnType>[] = [];
    idmIds.forEach((idmId) => {
      const adapter = this.getAdapterById(idmId);
      if (!adapter) {
        this.logger.error(`No adapter found for IDM: ${idmId}`);
        return [];
      }
      idmRequests.push(adapter.getGroups(clientId, schoolIds));
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

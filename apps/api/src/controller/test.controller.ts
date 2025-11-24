import { Controller, Get, Inject } from '@nestjs/common';
import { Clearance } from '../clearance/entity/clearance.entity';
import { ClearanceService } from '../clearance/clearance.service';
import { Aggregator } from '../identity-management/aggregator/aggregator';
import { GroupsPerIdmModel } from '../identity-management/model/groups-per-idm.model';
import { SchulconnexGroup } from '../identity-management/dto/schulconnex/schulconnex-group.dto';
import {
  AllowResourceOwnerType,
  RequireScope,
  ResourceOwnerType,
} from '../common/auth';
import { ScopeIdentifier } from '../common/auth/scope/scope-identifier';
import { OffersFetcher } from '../offers/fetcher/offers.fetcher';
import { OfferItem } from '../offers/model/response/offer-item.model';

// @todo: Remove after implementation of clearance database!

interface TestResponse {
  groups: GroupsPerIdmModel[];
  clearanceEntries: Clearance[];
  offerIdForClientId: OfferItem['offerId'] | undefined;
}

@Controller('/')
export class TestController {
  constructor(
    @Inject(ClearanceService) private clearanceService: ClearanceService,
    @Inject(OffersFetcher) private offersFetcher: OffersFetcher,
    private readonly aggregator: Aggregator,
  ) {}

  @Get('test')
  @AllowResourceOwnerType(ResourceOwnerType.CLIENT)
  @RequireScope(ScopeIdentifier.SCHULCONNEX_ACCESS)
  async test(): Promise<TestResponse> {
    const groups = await this.fetchGroups();

    await this.createEntriesForGroups(groups);

    // Retrieve all clearance entries
    const clearanceEntries = await this.clearanceService.findAll();

    const offerForClientId =
      await this.offersFetcher.fetchOfferForClientId('springboot-demo');

    return {
      offerIdForClientId: offerForClientId?.offerId,
      groups: groups,
      clearanceEntries: clearanceEntries,
    };
  }

  private async fetchGroups(): Promise<GroupsPerIdmModel[]> {
    const availableIdms = ['eduplaces', 'eduplaces-staging', 'DE-BY-vidis-idp'];

    const selectedIdms = availableIdms
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * availableIdms.length) + 1);

    return await this.aggregator.getGroups(selectedIdms);
  }

  private async createEntriesForGroups(
    groups: GroupsPerIdmModel[],
  ): Promise<void> {
    const availableOfferIds = [87654321, 12345678];

    const availableSchoolIds = [
      'DE-BY-1234',
      'test-school-' + Math.random().toString(),
      'test-school-' + Math.random().toString(),
      'test-school-' + Math.random().toString(),
    ];

    await Promise.all(
      groups.map((groupSet: GroupsPerIdmModel) => {
        return groupSet.groups.map(
          async (groupEntry: SchulconnexGroup): Promise<Clearance> => {
            const offerId =
              availableOfferIds[
                Math.floor(Math.random() * availableOfferIds.length)
              ];
            const schoolId =
              availableSchoolIds[
                Math.floor(Math.random() * availableSchoolIds.length)
              ];

            const clearance = new Clearance();
            clearance.offerId = offerId;
            clearance.schoolId = schoolId;
            clearance.idmId = groupSet.idm;
            clearance.groupId = groupEntry.id;

            return (await this.clearanceService
              .save(clearance)
              .catch((e: unknown) => {
                // eslint-disable-next-line
                console.log(e);
              })) as Clearance;
          },
        );
      }),
    );
  }
}

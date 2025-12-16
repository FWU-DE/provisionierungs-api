import { Controller, Get, Inject } from '@nestjs/common';

import { ClearanceService } from '../clearance/clearance.service';
import { Clearance } from '../clearance/entity/clearance.entity';
import { AllowResourceOwnerType, RequireScope, ResourceOwnerType } from '../common/auth';
import { ScopeIdentifier } from '../common/auth/scope/scope-identifier';
import { Aggregator } from '../identity-management/aggregator/aggregator';
import { SchulconnexGroup } from '../identity-management/dto/schulconnex/schulconnex-group.dto';
import { GroupsPerIdmModel } from '../identity-management/model/groups-per-idm.model';
import { OffersFetcher } from '../offers/fetcher/offers.fetcher';
import { OfferItem } from '../offers/model/response/offer-item.model';

// @todo: Remove after implementation of clearance database!

interface TestResponse {
  groups: GroupsPerIdmModel[];
  clearanceEntries: Clearance[];
  offerIdForClientId: OfferItem['offerId'] | undefined;
}

const TEST_CLIENT_ID = 'bettermarks-o';
const BETTERMARKS_OFFER_ID = 1703890;
const VIDIS_TEST_OFFER_ID = 2528476;

const AVAILABLE_SCHOOL_IDS = ['SL_00099', 'SL_98108'];

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
    const groups = await this.fetchGroups(AVAILABLE_SCHOOL_IDS);

    await this.createTestClearanceEntriesForGroups(groups);

    // Retrieve all clearance entries
    const clearanceEntries = await this.clearanceService.findAll();

    const offerForClientId = await this.offersFetcher.fetchOfferForClientId(TEST_CLIENT_ID);

    return {
      offerIdForClientId: offerForClientId?.offerId,
      groups: groups,
      clearanceEntries: clearanceEntries,
    };
  }

  private async fetchGroups(schoolIds?: string[]): Promise<GroupsPerIdmModel[]> {
    return await this.aggregator.getGroups(['saarland'], schoolIds);
  }

  private async createTestClearanceEntriesForGroups(groups: GroupsPerIdmModel[]): Promise<void> {
    const availableOfferIds = [BETTERMARKS_OFFER_ID, VIDIS_TEST_OFFER_ID];

    await Promise.all(
      groups.map((groupSet: GroupsPerIdmModel) => {
        return groupSet.groups.map(async (groupEntry: SchulconnexGroup): Promise<Clearance> => {
          const offerId = availableOfferIds[Math.floor(Math.random() * availableOfferIds.length)];
          const schoolId =
            AVAILABLE_SCHOOL_IDS[Math.floor(Math.random() * AVAILABLE_SCHOOL_IDS.length)];

          const clearance = new Clearance();
          clearance.offerId = offerId;
          clearance.schoolId = schoolId;
          clearance.idmId = groupSet.idm;
          clearance.groupId = groupEntry.id;

          return (await this.clearanceService.save(clearance).catch((e: unknown) => {
            // eslint-disable-next-line
            console.log(e);
          })) as Clearance;
        });
      }),
    );
  }
}

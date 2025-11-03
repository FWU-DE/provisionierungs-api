import { Controller, Get, Inject } from '@nestjs/common';
import { Clearance } from '../clearance/clearance.entity';
import { ClearanceService } from '../clearance/clearance.service';
import { Aggregator } from '../identity-provider/aggregator/aggregator';
import { ApiGroupsDto } from '../dto/api.groups.dto';
import { SchulconnexGroup } from '../dto/schulconnex-group.dto';

// @todo: Remove after implementation of clearance database!

interface TestResponse {
  groups: ApiGroupsDto[];
  clearanceEntries: Clearance[];
}

@Controller('/')
export class TestController {
  constructor(
    @Inject(ClearanceService) private clearanceService: ClearanceService,
    private readonly aggregator: Aggregator,
  ) {}

  @Get('test')
  async test(): Promise<TestResponse> {
    /*
      // @todo:   Mock UI behaviour:
        // @todo:   Prepare reading the admin user's JWT for the "heimatorganisation" and "schulkennung" claims??? How do we get these information?
        // @todo:   Prepare query to VIDIS Offer API endpoint to fetch all schools and find the one with the given "schulkennung" to determine the organizationId.
        //            Endpoint:   https://fwu-de.github.io/bmi-docs/api/vidis#tag/IDMBetreiber/operation/getAllOffers
        // @todo:   Prepare query to VIDIS Offer API endpoint to fetch the activated apps for the given organizationId. => appId[]
        // @todo:   Prepare clearance configuration for fields/field-groups. [needs to be defined/conceptualized first!].

      // @todo:   Implement API behaviour:
        // @todo:   Only query the IdP ("heimatorganisation") that is derived from the client information.
     */

    const availableIdps = ['eduplaces', 'eduplaces-staging'];

    const selectedIdps = availableIdps
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * availableIdps.length) + 1);

    /*
     * UI Logic
     */
    const groups: ApiGroupsDto[] =
      await this.aggregator.getGroups(selectedIdps);

    /*
     * API Logic
     */
    const availableClientIds = ['fake-client-id', 'client-1', 'client-2'];

    await Promise.all(
      groups.map((groupSet: ApiGroupsDto) => {
        return groupSet.groups.map(
          async (groupEntry: SchulconnexGroup): Promise<Clearance> => {
            const clearance = new Clearance();
            clearance.appId =
              availableClientIds[
                Math.floor(Math.random() * availableClientIds.length)
              ];
            clearance.schoolId =
              'test-school-' + new Date().toLocaleTimeString();
            clearance.idpId = groupSet.idp;
            clearance.groupId = groupEntry.id;
            return await this.clearanceService.save(clearance);
          },
        );
      }),
    );

    // const clearance = new Clearance();
    // clearance.appId =
    //   availableClientIds[Math.floor(Math.random() * availableClientIds.length)];
    // clearance.schoolId = 'test-school-' + new Date().toLocaleTimeString();
    // clearance.idpId =
    //   availableIdps[Math.floor(Math.random() * availableIdps.length)];
    // clearance.groupId = 'test-group-' + new Date().toLocaleTimeString();
    // await this.clearanceService.save(clearance);

    const clearanceEntries = await this.clearanceService.findAll();

    // if (clearanceEntries[0]) {
    //   await this.clearanceService.delete(clearanceEntries[0]);
    // }

    return {
      groups: groups,
      clearanceEntries: clearanceEntries,
    };
  }
}

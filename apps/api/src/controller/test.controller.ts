import { Controller, Get, Inject } from '@nestjs/common';
import { NoAccessTokenAuthRequired } from '../auth';
import { ClearanceService } from '../clearance/clearance.service';
import { Clearance } from '../clearance/clearance.entity';

// @todo: Remove after implementation of clearance database!

interface TestResponse {
  test: string;
  clearanceEntries: Clearance[];
}

@Controller('/')
export class TestController {
  constructor(
    @Inject(ClearanceService) private clearanceService: ClearanceService,
  ) {}

  @Get('test')
  @NoAccessTokenAuthRequired()
  async test(): Promise<TestResponse> {
    const clearance = new Clearance();
    clearance.appId = 'test-app-' + new Date().toLocaleTimeString();
    clearance.idpId = 'test-idp-' + new Date().toLocaleTimeString();
    clearance.organizationId =
      'test-organization-' + new Date().toLocaleTimeString();
    await this.clearanceService.save(clearance);

    const clearanceEntries = await this.clearanceService.findAll();

    if (clearanceEntries[0]) {
      await this.clearanceService.delete(clearanceEntries[0]);
    }

    return {
      test: 'test',
      clearanceEntries: clearanceEntries,
    };
  }
}

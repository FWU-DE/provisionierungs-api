import { Module } from '@nestjs/common';

import { ClearanceModule } from '../clearance/clearance.module';
import { LogModule } from '../common/logger';
import { IdentityProviderModule } from '../identity-management/identity-provider.module';
import { OffersModule } from '../offers/offers.module';
import { PersonenInfoController } from './personen-info.controller';
import { TestController } from './test.controller';

// @todo: Cleanup after removal of TestController.
@Module({
  imports: [IdentityProviderModule, ClearanceModule, OffersModule, LogModule],
  controllers: [PersonenInfoController, TestController],
})
export class ControllerModule {}

import { Module } from '@nestjs/common';
import { ClearanceModule } from '../clearance/clearance.module';
import { IdentityProviderModule } from '../identity-management/identity-provider.module';
import { PersonenInfoController } from './personen-info.controller';
import { TestController } from './test.controller';
import { OffersModule } from '../offers/offers.module';

// @todo: Cleanup after removal of TestController.
@Module({
  imports: [IdentityProviderModule, ClearanceModule, OffersModule],
  controllers: [PersonenInfoController, TestController],
})
export class ControllerModule {}

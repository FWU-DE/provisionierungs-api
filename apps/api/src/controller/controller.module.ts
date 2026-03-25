import { Module } from '@nestjs/common';

import { ClearanceModule } from '../clearance/clearance.module';
import { LogModule } from '../common/logger';
import { IdentityProviderModule } from '../identity-management/identity-provider.module';
import { OffersModule } from '../offers/offers.module';
import { PersonInfoController } from './person-info.controller';
import { PersonenInfoController } from './personen-info.controller';

@Module({
  imports: [IdentityProviderModule, ClearanceModule, OffersModule, LogModule],
  controllers: [PersonenInfoController, PersonInfoController],
})
export class ControllerModule {}

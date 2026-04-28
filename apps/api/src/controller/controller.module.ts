import { Module } from '@nestjs/common';

import { ClearanceModule } from '../clearance/clearance.module';
import { LogModule } from '../common/logger';
import { IdentityProviderModule } from '../identity-management/identity-provider.module';
import { OffersModule } from '../offers/offers.module';
import { PersonInfoController } from './person-info.controller';
import { PersonenInfoController } from './personen-info.controller';
import { ClearanceValidationService } from './service/clearance-validation.service';
import { PersonInfoService } from './service/person-info.service';

@Module({
  imports: [IdentityProviderModule, ClearanceModule, OffersModule, LogModule],
  controllers: [PersonenInfoController, PersonInfoController],
  providers: [ClearanceValidationService, PersonInfoService],
})
export class ControllerModule {}

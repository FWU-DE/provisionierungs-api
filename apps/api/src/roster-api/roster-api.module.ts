import { Module } from '@nestjs/common';
import { ClearanceModule } from '../clearance/clearance.module';
import { IdentityProviderModule } from '../identity-provider/identity-provider.module';
import { PersonenInfoController } from './personen-info.controller';

@Module({
  imports: [IdentityProviderModule, ClearanceModule],
  controllers: [PersonenInfoController],
})
export class RosterApiModule {}

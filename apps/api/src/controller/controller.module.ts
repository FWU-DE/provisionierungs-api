import { Module } from '@nestjs/common';
import { ClearanceModule } from '../clearance/clearance.module';
import { IdentityProviderModule } from '../identity-provider/identity-provider.module';
import { PersonenInfoController } from './personen-info.controller';
import { TestController } from './test.controller';

@Module({
  imports: [IdentityProviderModule, ClearanceModule],
  controllers: [PersonenInfoController, TestController],
})
export class ControllerModule {}

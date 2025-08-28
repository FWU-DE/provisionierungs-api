import { Module } from '@nestjs/common';
import { PersonenInfoController } from './personen-info.controller';
import { IdentityProviderModule } from '../identity-provider/identity-provider.module';

@Module({
  imports: [IdentityProviderModule],
  controllers: [PersonenInfoController],
})
export class RosterApiModule {}

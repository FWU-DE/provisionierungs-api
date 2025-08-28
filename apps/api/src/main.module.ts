import { Module } from '@nestjs/common';

import { RosterApiModule } from './roster-api/roster-api.module';

@Module({
  imports: [RosterApiModule],
})
export class MainModule {}

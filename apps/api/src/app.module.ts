import { Module } from '@nestjs/common';

import { AppService } from './app.service';
import { AppController } from './app.controller';
import { RosterApiModule } from './roster-api/roster-api.module';

@Module({
  imports: [RosterApiModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

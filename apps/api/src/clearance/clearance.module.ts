import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LogModule } from '../common/logger';
import { GroupClearance } from './entity/group-clearance.entity';
import { SchoolClearance } from './entity/school-clearance.entity';
import { GroupClearanceService } from './group-clearance.service';
import { SchoolClearanceService } from './school-clearance.service';

@Module({
  imports: [
    LogModule,
    TypeOrmModule.forFeature([GroupClearance]),
    TypeOrmModule.forFeature([SchoolClearance]),
  ],
  providers: [GroupClearanceService, SchoolClearanceService],
  exports: [GroupClearanceService, SchoolClearanceService],
})
export class ClearanceModule {}

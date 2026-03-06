import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LogModule } from '../common/logger';
import { GroupClearance } from './entity/group-clearance.entity';
import { SchoolClearance } from './entity/school-clearance.entity';
import { GroupClearanceAllQuery } from './graphql/group-clearance-all.query';
import { GroupClearanceCreateMutation } from './graphql/group-clearance-create.mutation';
import { GroupClearanceDeleteAllMutation } from './graphql/group-clearance-delete-all.mutation';
import { GroupClearanceDeleteMutation } from './graphql/group-clearance-delete.mutation';
import { SchoolClearanceAllQuery } from './graphql/school-clearance-all.query';
import { SchoolClearanceCreateMutation } from './graphql/school-clearance-create.mutation';
import { SchoolClearanceDeleteMutation } from './graphql/school-clearance-delete.mutation';
import { GroupClearanceService } from './group-clearance.service';
import { SchoolClearanceService } from './school-clearance.service';

@Module({
  imports: [
    LogModule,
    TypeOrmModule.forFeature([GroupClearance]),
    TypeOrmModule.forFeature([SchoolClearance]),
  ],
  providers: [
    GroupClearanceService,
    GroupClearanceAllQuery,
    GroupClearanceCreateMutation,
    GroupClearanceDeleteAllMutation,
    GroupClearanceDeleteMutation,
    SchoolClearanceService,
    SchoolClearanceAllQuery,
    SchoolClearanceCreateMutation,
    SchoolClearanceDeleteMutation,
  ],
  exports: [GroupClearanceService, SchoolClearanceService],
})
export class ClearanceModule {}

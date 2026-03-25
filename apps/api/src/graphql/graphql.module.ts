import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ClearanceModule } from '../clearance/clearance.module';
import { GroupClearance } from '../clearance/entity/group-clearance.entity';
import { SchoolClearance } from '../clearance/entity/school-clearance.entity';
import { LogModule } from '../common/logger';
import { IdentityProviderModule } from '../identity-management/identity-provider.module';
import { OffersModule } from '../offers/offers.module';
import { GroupClearanceAllQuery } from './clearance/group-clearance-all.query';
import { GroupClearanceCreateMutation } from './clearance/group-clearance-create.mutation';
import { GroupClearanceDeleteAllMutation } from './clearance/group-clearance-delete-all.mutation';
import { GroupClearanceDeleteMutation } from './clearance/group-clearance-delete.mutation';
import { SchoolClearanceAllQuery } from './clearance/school-clearance-all.query';
import { SchoolClearanceCreateMutation } from './clearance/school-clearance-create.mutation';
import { SchoolClearanceDeleteMutation } from './clearance/school-clearance-delete.mutation';
import { GroupAllQuery } from './identity-management/group-all.query';
import { OffersQuery } from './offers/offers.query';

@Module({
  imports: [
    LogModule,
    IdentityProviderModule,
    ClearanceModule,
    OffersModule,
    TypeOrmModule.forFeature([GroupClearance]),
    TypeOrmModule.forFeature([SchoolClearance]),
  ],
  providers: [
    GroupAllQuery,
    GroupClearanceAllQuery,
    GroupClearanceCreateMutation,
    GroupClearanceDeleteAllMutation,
    GroupClearanceDeleteMutation,
    SchoolClearanceAllQuery,
    SchoolClearanceCreateMutation,
    SchoolClearanceDeleteMutation,
    OffersQuery,
  ],
})
export class RosteringGraphqlModule {}

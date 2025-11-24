import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Clearance } from './entity/clearance.entity';
import { ClearanceService } from './clearance.service';
import { ClearanceAllQuery } from './graphql/clearance-all.query';
import { ClearanceCreateMutation } from './graphql/clearance-create.mutation';
import { ClearanceDeleteMutation } from './graphql/clearance-delete.mutation';

@Module({
  imports: [TypeOrmModule.forFeature([Clearance])],
  providers: [
    ClearanceService,
    ClearanceAllQuery,
    ClearanceCreateMutation,
    ClearanceDeleteMutation,
  ],
  exports: [ClearanceService],
})
export class ClearanceModule {}

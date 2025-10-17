import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Clearance } from './clearance.entity';
import { ClearanceService } from './clearance.service';
import { ClearanceQuery } from './clearance.query';

@Module({
  imports: [TypeOrmModule.forFeature([Clearance])],
  providers: [ClearanceService, ClearanceQuery],
  exports: [ClearanceService],
})
export class ClearanceModule {}

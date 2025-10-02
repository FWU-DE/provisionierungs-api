import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Clearance } from './clearance.entity';
import { ClearanceService } from './clearance.service';

@Module({
  imports: [TypeOrmModule.forFeature([Clearance])],
  providers: [ClearanceService],
  exports: [ClearanceService],
})
export class ClearanceModule {}

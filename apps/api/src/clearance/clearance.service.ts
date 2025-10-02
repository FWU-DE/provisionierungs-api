import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  type EntityManager,
  type FindOptionsRelations,
  type FindOptionsSelect,
  type FindOptionsWhere,
  type Repository,
} from 'typeorm';
import { Clearance } from './clearance.entity';
import { EntityService } from '../database/entity.service';
import type { ResolveRelations } from '../database/typeorm';

@Injectable()
export class ClearanceService extends EntityService<Clearance> {
  constructor(
    @InjectRepository(Clearance)
    clearanceRepository: Repository<Clearance>,
  ) {
    super(clearanceRepository);
  }

  async findAll<TRelations extends FindOptionsRelations<Clearance>>(options?: {
    select?: FindOptionsSelect<Clearance>;
    relations?: TRelations;
    transactionManager?: EntityManager;
    where?: FindOptionsWhere<Clearance>;
  }): Promise<ResolveRelations<TRelations, Clearance>[]> {
    return (await this.getRepository(options?.transactionManager).find({
      select: options?.select,
      relations: options?.relations,
      where: options?.where,
    })) as ResolveRelations<TRelations, Clearance>[];
  }
}

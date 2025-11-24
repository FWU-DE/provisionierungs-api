import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeleteResult,
  type EntityManager,
  type FindOptionsRelations,
  type FindOptionsSelect,
  type FindOptionsWhere,
  In,
  type Repository,
} from 'typeorm';
import { Clearance } from './entity/clearance.entity';
import { EntityService } from '../common/database/entity.service';
import type { ResolveRelations } from '../common/database/typeorm';

@Injectable()
export class ClearanceService extends EntityService<Clearance> {
  constructor(
    @InjectRepository(Clearance)
    clearanceRepository: Repository<Clearance>,
  ) {
    super(clearanceRepository);
  }

  async save(
    clearance: Clearance,
    transactionManager?: EntityManager,
  ): Promise<Clearance> {
    return this.getRepository(transactionManager).save(clearance);
  }

  async delete(
    id: Clearance['id'],
    transactionManager?: EntityManager,
  ): Promise<DeleteResult> {
    return this.getRepository(transactionManager).delete(id);
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

  async findByIdmAndSchools<TRelations extends FindOptionsRelations<Clearance>>(
    idmId: Clearance['idmId'],
    schoolIds: Clearance['schoolId'][],
    options?: {
      select?: FindOptionsSelect<Clearance>;
      relations?: TRelations;
      transactionManager?: EntityManager;
    },
  ): Promise<ResolveRelations<TRelations, Clearance>[]> {
    const repository = this.getRepository(options?.transactionManager);

    return (await repository.find({
      select: options?.select,
      relations: options?.relations,
      where: {
        idmId: idmId,
        schoolId: In(schoolIds),
      },
    })) as ResolveRelations<TRelations, Clearance>[];
  }

  async findAllForOffer(offerId: number): Promise<Clearance[]> {
    return this.findAll({
      where: {
        offerId: offerId,
      },
    });
  }
}

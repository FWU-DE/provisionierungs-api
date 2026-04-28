import { Inject, Injectable } from '@nestjs/common';
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

import { EntityService } from '../common/database/entity.service';
import type { ResolveRelations } from '../common/database/typeorm';
import { Logger } from '../common/logger';
import { SchoolClearance } from './entity/school-clearance.entity';

@Injectable()
export class SchoolClearanceService extends EntityService<SchoolClearance> {
  constructor(
    @InjectRepository(SchoolClearance)
    schoolClearanceRepository: Repository<SchoolClearance>,
    @Inject(Logger) private readonly logger: Logger,
  ) {
    super(schoolClearanceRepository);
    this.logger.setContext(SchoolClearanceService.name);
  }

  async save(
    schoolClearance: SchoolClearance,
    transactionManager?: EntityManager,
  ): Promise<SchoolClearance> {
    this.logger.log(`SchoolClearanceService: Saving school clearance entry.`, {
      offerId: schoolClearance.offerId,
      idmId: schoolClearance.idmId,
      schoolId: schoolClearance.schoolId,
    });
    await this.getRepository(transactionManager)
      .createQueryBuilder()
      .insert()
      .into(SchoolClearance)
      .values(schoolClearance)
      .orIgnore()
      .execute();

    return schoolClearance;
  }

  async delete(
    id: SchoolClearance['id'],
    transactionManager?: EntityManager,
  ): Promise<DeleteResult> {
    return this.getRepository(transactionManager).delete(id);
  }

  async findAll<TRelations extends FindOptionsRelations<SchoolClearance>>(options?: {
    select?: FindOptionsSelect<SchoolClearance>;
    relations?: TRelations;
    transactionManager?: EntityManager;
    where?: FindOptionsWhere<SchoolClearance>;
  }): Promise<ResolveRelations<TRelations, SchoolClearance>[]> {
    return (await this.getRepository(options?.transactionManager).find({
      select: options?.select,
      relations: options?.relations,
      where: options?.where,
    })) as ResolveRelations<TRelations, SchoolClearance>[];
  }

  async findByIdmAndSchools<TRelations extends FindOptionsRelations<SchoolClearance>>(
    idmId: SchoolClearance['idmId'],
    schoolIds: SchoolClearance['schoolId'][],
    offerId?: SchoolClearance['offerId'],
    options?: {
      select?: FindOptionsSelect<SchoolClearance>;
      relations?: TRelations;
      transactionManager?: EntityManager;
    },
  ): Promise<ResolveRelations<TRelations, SchoolClearance>[]> {
    const repository = this.getRepository(options?.transactionManager);

    const where: FindOptionsWhere<SchoolClearance> = {
      idmId: idmId,
      schoolId: In(schoolIds),
    };

    if (offerId !== undefined) {
      where.offerId = offerId;
    }

    return (await repository.find({
      select: options?.select,
      relations: options?.relations,
      where: where,
    })) as ResolveRelations<TRelations, SchoolClearance>[];
  }

  async findAllForOffer(offerId: number): Promise<SchoolClearance[]> {
    return this.findAll({
      where: {
        offerId: offerId,
      },
    });
  }
}

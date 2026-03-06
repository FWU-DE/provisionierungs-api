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

import { EntityService } from '../common/database/entity.service';
import type { ResolveRelations } from '../common/database/typeorm';
import { GroupClearance } from './entity/group-clearance.entity';

@Injectable()
export class GroupClearanceService extends EntityService<GroupClearance> {
  constructor(
    @InjectRepository(GroupClearance)
    groupClearanceRepository: Repository<GroupClearance>,
  ) {
    super(groupClearanceRepository);
  }

  async save(
    groupClearance: GroupClearance,
    transactionManager?: EntityManager,
  ): Promise<GroupClearance> {
    await this.getRepository(transactionManager)
      .createQueryBuilder()
      .insert()
      .into(GroupClearance)
      .values(groupClearance)
      .orIgnore()
      .execute();

    return groupClearance;
  }

  async delete(
    id: GroupClearance['id'],
    transactionManager?: EntityManager,
  ): Promise<DeleteResult> {
    return this.getRepository(transactionManager).delete(id);
  }

  async deleteAll(
    offerId: GroupClearance['offerId'],
    idmId: GroupClearance['idmId'],
    schoolId: GroupClearance['schoolId'],
    transactionManager?: EntityManager,
  ): Promise<DeleteResult> {
    return this.getRepository(transactionManager).delete({
      offerId: offerId,
      idmId: idmId,
      schoolId: schoolId,
    });
  }

  async findAll<TRelations extends FindOptionsRelations<GroupClearance>>(options?: {
    select?: FindOptionsSelect<GroupClearance>;
    relations?: TRelations;
    transactionManager?: EntityManager;
    where?: FindOptionsWhere<GroupClearance>;
  }): Promise<ResolveRelations<TRelations, GroupClearance>[]> {
    return (await this.getRepository(options?.transactionManager).find({
      select: options?.select,
      relations: options?.relations,
      where: options?.where,
    })) as ResolveRelations<TRelations, GroupClearance>[];
  }

  async findByIdmAndSchools<TRelations extends FindOptionsRelations<GroupClearance>>(
    idmId: GroupClearance['idmId'],
    schoolIds: GroupClearance['schoolId'][],
    offerId?: GroupClearance['offerId'],
    options?: {
      select?: FindOptionsSelect<GroupClearance>;
      relations?: TRelations;
      transactionManager?: EntityManager;
    },
  ): Promise<ResolveRelations<TRelations, GroupClearance>[]> {
    const repository = this.getRepository(options?.transactionManager);

    const where: FindOptionsWhere<GroupClearance> = {
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
    })) as ResolveRelations<TRelations, GroupClearance>[];
  }

  // @todo: Replace with usage of findByIdmAndSchools!
  // @deprecated Use findByIdmAndSchools instead!
  async findAllForOffer(offerId: number): Promise<GroupClearance[]> {
    // @todo: Don't we have to filter down to IDM as well at least?
    return this.findAll({
      where: {
        offerId: offerId,
      },
    });
  }
}

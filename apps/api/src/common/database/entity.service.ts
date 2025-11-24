import type { DataSource, EntityManager, Repository } from 'typeorm';

import type { BaseEntity } from './base.entity';

export abstract class EntityService<T extends BaseEntity> {
  constructor(private readonly repository: Repository<T>) {}

  protected getRepository(manager?: EntityManager): Repository<T> {
    return manager
      ? manager.getRepository(this.repository.target)
      : this.repository;
  }

  protected async runInTransaction<T>(
    dataSource: DataSource,
    cb: (manager: EntityManager) => Promise<T>,
  ): Promise<T> {
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const ret = await cb(queryRunner.manager);
      await queryRunner.commitTransaction();
      return ret;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}

import type { EntityManager } from 'typeorm';
import { BaseEntity } from '../../database/base.entity';
import { ensureError } from '@fwu-rostering/utils/error';

export class Persister {
  private readonly persisted = new Map<BaseEntity, true>();
  private readonly persistedIds = new Map<
    typeof BaseEntity.constructor.name,
    string[]
  >();
  constructor(
    private readonly entityManager: EntityManager,
    private readonly fixtures: BaseEntity[],
  ) {}

  async persist(): Promise<void> {
    for (const fixture of this.fixtures) {
      await this.persistFixture(fixture);
    }
  }

  private async persistFixture(entity: BaseEntity): Promise<void> {
    if (this.persisted.has(entity)) {
      return;
    }

    try {
      await this.persistRelations(entity);
      if (
        (this.persistedIds.get(entity.constructor.name) ?? []).includes(
          entity.id,
        )
      ) {
        throw new Error(
          `Duplicate ID found for entity "${entity.constructor.name}" with ID "${entity.id}"`,
        );
      }

      await this.entityManager.save(entity);
      this.persisted.set(entity, true);
      this.persistedIds.set(entity.constructor.name, [
        ...(this.persistedIds.get(entity.constructor.name) ?? []),
        entity.id,
      ]);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(
        `Error persisting entity: ${ensureError(e).message}`,
        entity,
      );
      throw e;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  async persistRelations<T extends BaseEntity>(fixture: T): Promise<void> {
    const { relations } = this.entityManager.connection.getMetadata(
      fixture.constructor,
    );

    for (const { propertyName, relationType } of relations) {
      switch (relationType) {
        case 'many-to-many':
        case 'one-to-many':
          await this.persistManyRelation<T>(fixture, propertyName as keyof T);
          break;

        case 'many-to-one':
        case 'one-to-one':
          await this.persistOneRelation<T>(fixture, propertyName as keyof T);
          break;
      }
    }
  }

  async persistManyRelation<T extends BaseEntity>(
    fixture: T,
    propertyName: keyof T,
  ): Promise<void> {
    const relation = fixture[propertyName] as unknown;
    if (!relation) {
      return;
    }

    if (!Array.isArray(relation)) {
      throw new Error(
        `Relation for ${fixture.constructor.name}::${propertyName.toString()} is not an array`,
      );
    }

    for (const entry of relation) {
      if (!(entry instanceof BaseEntity)) {
        throw new Error(
          `Relation for ${
            fixture.constructor.name
          }::${propertyName.toString()} is not an instance of BaseEntity`,
        );
      }
      await this.persistFixture(entry);
    }
  }

  async persistOneRelation<T extends BaseEntity>(
    fixture: T,
    propertyName: keyof T,
  ): Promise<void> {
    const relation = fixture[propertyName] as unknown;
    if (!relation) {
      return;
    }

    if (!(relation instanceof BaseEntity)) {
      throw new Error(
        `Relation for ${
          fixture.constructor.name
        }::${propertyName.toString()} is not an instance of BaseEntity`,
      );
    }

    await this.persistFixture(relation);
  }
}

import type { Identity, PropertiesOnly } from '@fwu-rostering/utils/typescript';
import type { FindOptionsRelations } from 'typeorm';

import type { BaseEntity } from './base.entity';

type NullableIndex<TObject, TProp extends keyof NonNullable<TObject>> = null extends TObject
  ? NonNullable<TObject>[TProp] | null
  : NonNullable<TObject>[TProp];

type ResolveRelationsImpl<TRelations extends FindOptionsRelations<TEntity>, TEntity> = {
  [P in keyof TRelations]: P extends keyof NonNullable<TEntity>
    ? // Recursive call to ResolveRelations
      TRelations[P] extends object
      ? ResolveRelations<TRelations[P], Exclude<NullableIndex<TEntity, P>, undefined>>
      : // Handle {relation:true} and {relation:false}
        TRelations[P] extends true
        ? // Exclude undefined
          Exclude<NullableIndex<TEntity, P>, undefined>
        : // simply pass property with nullability
          NullableIndex<TEntity, P>
    : never;
};

// Extends an Entity with Relations. With array support
type ExtendEntityImpl<
  TRelations extends FindOptionsRelations<TEntity>,
  TEntity,
> = TEntity extends unknown[]
  ? (TEntity[number] & ResolveRelationsImpl<TRelations, TEntity[number]>)[]
  : TEntity & ResolveRelationsImpl<TRelations, TEntity>;

// This works in the following way:
// 1. The result is `TEntity & TResolveResult`, ie the Entity is always present
// 2. TResolveResult contains all keys of the TRelations objects used in typeorm
// 3. For each Property in TRelations, remove undefined
// 4. If the property is an object, recursively call ResolveRelations
export type ResolveRelations<
  TRelations extends FindOptionsRelations<TEntity>,
  TEntity,
> = null extends TEntity
  ? ExtendEntityImpl<TRelations, TEntity> | null
  : ExtendEntityImpl<TRelations, TEntity>;

export type PopulatedRelations<TEntity, TProps extends keyof TEntity> = TEntity & {
  [P in TProps]-?: TEntity[P];
};

export type EntityCreateData<TEntity extends BaseEntity, TOptionalProps extends keyof TEntity> =
  // Use `Identity` to flatten out all properties
  Identity<
    // First all required properties
    Omit<PropertiesOnly<TEntity>, keyof BaseEntity | TOptionalProps> &
      // And then add all optional properties
      Partial<Omit<PropertiesOnly<TEntity>, keyof BaseEntity>>
  >;

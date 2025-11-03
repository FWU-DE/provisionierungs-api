import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../database/base.entity';
import { Field, ObjectType } from '@nestjs/graphql';

@Entity()
@ObjectType()
export class Clearance extends BaseEntity {
  @Column({ type: 'text' })
  @Field()
  appId!: string;

  @Column({ type: 'text' })
  @Field()
  schoolId!: string;

  @Column({ type: 'text' })
  @Field()
  idpId!: string;

  @Column({ type: 'text' })
  groupId!: string;
}

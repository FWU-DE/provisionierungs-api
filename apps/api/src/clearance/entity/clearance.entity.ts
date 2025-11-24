import { Column, Entity, Unique } from 'typeorm';
import { BaseEntity } from '../../common/database/base.entity';
import { Field, ObjectType } from '@nestjs/graphql';

@Entity()
@ObjectType()
@Unique(['offerId', 'idmId', 'schoolId', 'groupId'])
export class Clearance extends BaseEntity {
  @Column({ type: 'int' })
  @Field()
  offerId!: number;

  @Column({ type: 'text' })
  @Field()
  idmId!: string;

  @Column({ type: 'text' })
  @Field()
  schoolId!: string;

  @Column({ type: 'text' })
  @Field()
  groupId!: string;
}

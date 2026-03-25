import { Column, Entity, Unique } from 'typeorm';

import { BaseEntity } from '../../common/database/base.entity';

@Entity()
@Unique(['offerId', 'idmId', 'schoolId', 'schoolOrgId'])
export class SchoolClearance extends BaseEntity {
  @Column({ type: 'int' })
  offerId!: number;

  @Column({ type: 'text' })
  idmId!: string;

  @Column({ type: 'text' })
  schoolId!: string;

  @Column({ type: 'text' })
  schoolOrgId!: string;
}

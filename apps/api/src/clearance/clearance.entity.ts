import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../database/base.entity';

@Entity()
export class Clearance extends BaseEntity {
  @Column({ type: 'text' })
  appId!: string;

  @Column({ type: 'text' })
  idpId!: string;

  @Column({ type: 'text' })
  organizationId!: string;
}

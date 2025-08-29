import { Field, ID, InterfaceType } from '@nestjs/graphql';
import {
  CreateDateColumn,
  DeleteDateColumn,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Base entity for all of eduplaces database entities.
 */
// TypeORM decorators
// - none
// GraphQL decorators
@InterfaceType()
export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID, { defaultValue: undefined })
  id!: string;

  // Precision is set to 3 as postgresqls precision is greater than javascripts which leads to problems when comparing dates
  @CreateDateColumn({
    type: 'timestamp with time zone',
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP(3)',
  })
  @Field()
  createdAt!: Date;

  // Precision is set to 3 as postgresqls precision is greater than javascripts which leads to problems when comparing dates
  @UpdateDateColumn({
    type: 'timestamp with time zone',
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP(3)',
  })
  @Field()
  updatedAt!: Date;

  // Precision is set to 3 as postgresqls precision is greater than javascripts which leads to problems when comparing dates
  @DeleteDateColumn({
    type: 'timestamp with time zone',
    precision: 3,
    nullable: true,
  })
  @Index({ where: '"deleted_at" IS NULL' })
  @Field(() => Date, { nullable: true })
  deletedAt!: Date | null;

  isDeleted(): boolean {
    return this.deletedAt !== null;
  }
}

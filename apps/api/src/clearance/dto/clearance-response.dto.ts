import { Field, ObjectType } from '@nestjs/graphql';

import { Clearance } from '../entity/clearance.entity';

@ObjectType()
export class ClearanceResponse {
  @Field()
  id!: string;

  @Field()
  offerId!: number;

  @Field()
  idmId!: string;

  @Field()
  schoolId!: string;

  @Field()
  groupId!: string;

  constructor(clearance: Clearance) {
    this.id = clearance.id;
    this.offerId = clearance.offerId;
    this.idmId = clearance.idmId;
    this.schoolId = clearance.schoolId;
    this.groupId = clearance.groupId;
  }
}

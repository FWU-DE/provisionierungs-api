import { Field, ObjectType } from '@nestjs/graphql';

import { type GroupClearance } from '../entity/group-clearance.entity';

@ObjectType()
export class GroupClearanceResponseDto {
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

  constructor(clearance: GroupClearance) {
    this.id = clearance.id;
    this.offerId = clearance.offerId;
    this.idmId = clearance.idmId;
    this.schoolId = clearance.schoolId;
    this.groupId = clearance.groupId;
  }
}

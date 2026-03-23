import { Field, ObjectType } from '@nestjs/graphql';

import { type SchoolClearance } from '../entity/school-clearance.entity';

@ObjectType()
export class SchoolClearanceResponseDto {
  @Field()
  id!: string;

  @Field()
  offerId!: number;

  @Field()
  idmId!: string;

  @Field()
  schoolId!: string;

  constructor(clearance: SchoolClearance) {
    this.id = clearance.id;
    this.offerId = clearance.offerId;
    this.idmId = clearance.idmId;
    this.schoolId = clearance.schoolId;
  }
}

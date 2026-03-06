import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SchoolClearanceDeleteResponse {
  @Field()
  deleted!: boolean;

  constructor(acknowledged: boolean) {
    this.deleted = acknowledged;
  }
}

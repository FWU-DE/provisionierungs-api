import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class GroupClearanceDeleteResponse {
  @Field()
  deleted!: boolean;

  constructor(acknowledged: boolean) {
    this.deleted = acknowledged;
  }
}

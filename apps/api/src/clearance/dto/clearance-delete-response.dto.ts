import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ClearanceDeleteResponse {
  @Field()
  deleted!: boolean;

  constructor(acknowledged: boolean) {
    this.deleted = acknowledged;
  }
}

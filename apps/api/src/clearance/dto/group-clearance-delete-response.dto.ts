import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class GroupClearanceDeleteResponseDto {
  @Field()
  deleted!: boolean;

  constructor(acknowledged: boolean) {
    this.deleted = acknowledged;
  }
}

import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SchoolClearanceDeleteResponseDto {
  @Field()
  deleted!: boolean;

  constructor(acknowledged: boolean) {
    this.deleted = acknowledged;
  }
}

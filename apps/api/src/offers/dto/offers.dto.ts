import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class OffersDto {
  @Field()
  educationProviderOrganizationName!: string;

  @Field(() => Number)
  offerId!: number;

  @Field()
  offerTitle!: string;

  @Field()
  offerLongTitle!: string;

  @Field()
  offerDescription!: string;

  @Field()
  offerLink!: string;

  @Field()
  offerLogo!: string;
}

import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class OffersDto {
  @Field()
  educationProviderOrganizationName!: string;

  @Field()
  offerDescription!: string;

  @Field(() => Number)
  offerId!: number;

  @Field()
  offerLink!: string;

  @Field()
  offerLogo!: string;

  @Field()
  offerLongTitle!: string;

  @Field(() => Number)
  offerResourcePk!: number;

  @Field()
  offerStatus!: string;

  @Field()
  offerTitle!: string;

  @Field(() => Number)
  offerVersion!: number;
}

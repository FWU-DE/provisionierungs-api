import { z } from 'zod';

export const OfferSchema = z.object({
  educationProviderOrganizationName: z.string(),
  offerId: z.number(),
  offerTitle: z.string(),
  offerLongTitle: z.string().optional(),
  offerDescription: z.string().optional(),
  offerLink: z.string(),
  offerLogo: z.string(),
});
export type Offer = z.infer<typeof OfferSchema>;
export const OffersSchema = z.array(OfferSchema);

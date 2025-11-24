import z from 'zod';

const OfferCategoriesSchema = z.object({
  category: z.array(z.string()).optional(),
  competency: z.array(z.string()).optional(),
  gradeLevel: z.array(z.string()).optional(),
  schoolType: z.array(z.string()).optional(),
  'x-class-name': z.string().optional(),
});

const OfferItemSchema = z.object({
  clientId: z.union([z.string(), z.array(z.string())]).optional(),
  educationProviderOrganizationId: z.number().optional(),
  educationProviderOrganizationName: z.string(),
  educationProviderUserEmail: z.string().optional(),
  educationProviderUserId: z.number().optional(),
  educationProviderUserName: z.string().optional(),
  offerCategories: OfferCategoriesSchema.optional(),
  offerDescription: z.string().optional(),
  offerId: z.number(),
  offerLink: z.string().optional(),
  offerLogo: z.string().optional(),
  offerLongTitle: z.string().optional(),
  offerResourcePk: z.number().optional(),
  offerStatus: z.string().optional(),
  offerTitle: z.string().optional(),
  offerVersion: z.number().optional(),
  schoolActivations: z.array(z.string()).optional(),
  'x-class-name': z.string().optional(),
});

const ActionsSchema = z.record(z.string(), z.record(z.string(), z.string()));

const FacetValueSchema = z.object({
  numberOfOccurrences: z.number(),
  term: z.string(),
});

const FacetSchema = z.object({
  facetCriteria: z.string(),
  facetValues: z.array(FacetValueSchema),
});

const RootSchema = z.object({
  items: z.array(OfferItemSchema),
  lastPage: z.number(),
  totalCount: z.number(),
  pageSize: z.number(),
  actions: ActionsSchema,
  page: z.number(),
  facets: z.array(FacetSchema),
});

export const activatedOffersBySchoolResponseSchema = RootSchema;

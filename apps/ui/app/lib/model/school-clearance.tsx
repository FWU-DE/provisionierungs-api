import { z } from 'zod';

export const SchoolClearanceSchema = z.object({
  id: z.uuid().optional(),
  offerId: z.number(),
  idmId: z.string(),
  schoolId: z.string(),
});
export type SchoolClearance = z.infer<typeof SchoolClearanceSchema>;
export const SchoolClearancesSchema = z.array(SchoolClearanceSchema);

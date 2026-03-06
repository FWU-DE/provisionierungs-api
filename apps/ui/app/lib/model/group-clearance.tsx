import { z } from 'zod';

export const GroupClearanceSchema = z.object({
  id: z.uuid().optional(),
  offerId: z.number(),
  idmId: z.string(),
  schoolId: z.string(),
  groupId: z.string(),
});
export type GroupClearance = z.infer<typeof GroupClearanceSchema>;
export const GroupClearancesSchema = z.array(GroupClearanceSchema);

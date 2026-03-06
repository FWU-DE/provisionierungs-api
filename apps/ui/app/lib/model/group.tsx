import { z } from 'zod';

export const GroupSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
});

export type Group = z.infer<typeof GroupSchema>;
export const GroupsSchema = z.array(GroupSchema);

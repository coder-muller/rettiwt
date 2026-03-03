import { z } from "zod";

export const userSearchSchema = z.object({
  q: z.string().trim().min(2).max(50),
  limit: z.coerce.number().int().min(1).max(20).default(10),
});

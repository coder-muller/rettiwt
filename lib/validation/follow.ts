import { z } from "zod";

export const followTargetSchema = z.object({
  targetUserId: z.string().min(1),
});

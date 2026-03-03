import { z } from "zod";

export const adminUserQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
});

export const banUserSchema = z.object({
  userId: z.string().trim().min(1, "Usuario invalido."),
  banReason: z.string().trim().max(500).optional(),
  banExpiresIn: z.number().int().positive().optional(),
});

export const unbanUserSchema = z.object({
  userId: z.string().trim().min(1, "Usuario invalido."),
});

export const removeUserSchema = z.object({
  userId: z.string().trim().min(1, "Usuario invalido."),
});

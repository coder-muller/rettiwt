import { z } from "zod";

import { usernameSchema } from "@/lib/validation/auth";

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, "Nome precisa ter pelo menos 2 caracteres.").max(50),
  username: usernameSchema,
  bio: z
    .string()
    .trim()
    .max(160, "Bio pode ter no maximo 160 caracteres.")
    .transform((value) => value.replace(/\r\n/g, "\n")),
  avatarUrl: z.union([
    z.literal(""),
    z.string().trim().url("URL de avatar invalida.").max(500),
  ]),
});

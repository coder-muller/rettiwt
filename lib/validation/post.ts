import { z } from "zod";

export const createPostSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Post nao pode ser vazio.")
    .max(280, "Post pode ter no maximo 280 caracteres.")
    .transform((value) => value.replace(/\r\n/g, "\n")),
});

export const postIdSchema = z.object({
  postId: z.string().min(1),
});

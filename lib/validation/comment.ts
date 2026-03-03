import { z } from "zod";

export const commentIdSchema = z.object({
  commentId: z.string().min(1),
});

export const commentContentSchema = z
  .string()
  .trim()
  .min(1, "Comentario nao pode ser vazio.")
  .max(500, "Comentario pode ter no maximo 500 caracteres.")
  .transform((value) => value.replace(/\r\n/g, "\n"));

export const createCommentSchema = z.object({
  postId: z.string().min(1),
  content: commentContentSchema,
});

import { z } from "zod";

export const conversationIdSchema = z.object({
  conversationId: z.string().min(1),
});

export const startConversationSchema = z.object({
  targetUserId: z.string().min(1),
});

export const sendMessageSchema = z.object({
  conversationId: z.string().min(1),
  content: z
    .string()
    .trim()
    .min(1, "Mensagem nao pode ser vazia.")
    .max(2000, "Mensagem pode ter no maximo 2000 caracteres.")
    .transform((value) => value.replace(/\r\n/g, "\n")),
});

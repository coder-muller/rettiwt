import { z } from "zod";

const usernamePattern = /^[a-zA-Z0-9_.]+$/;

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Username precisa ter pelo menos 3 caracteres.")
  .max(30, "Username pode ter no maximo 30 caracteres.")
  .regex(usernamePattern, "Use apenas letras, numeros, underscore e ponto.");

export const signUpSchema = z.object({
  name: z.string().trim().min(2, "Nome precisa ter pelo menos 2 caracteres.").max(50),
  username: usernameSchema,
  email: z.string().trim().email("Informe um e-mail valido."),
  password: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres.").max(128),
});

export const signInSchema = z.object({
  identifier: z.string().trim().min(3, "Informe seu e-mail ou username."),
  password: z.string().min(8, "Senha invalida."),
});

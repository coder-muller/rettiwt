import { z } from "zod";

const usernamePattern = /^[a-zA-Z0-9_.]+$/;
const otpPattern = /^\d{6}$/;

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Username precisa ter pelo menos 3 caracteres.")
  .max(30, "Username pode ter no maximo 30 caracteres.")
  .regex(usernamePattern, "Use apenas letras, numeros, underscore e ponto.");

export const emailSchema = z.string().trim().email("Informe um e-mail valido.");

export const passwordSchema = z.string().min(8, "A senha precisa ter pelo menos 8 caracteres.").max(128);

export const otpSchema = z
  .string()
  .trim()
  .regex(otpPattern, "Informe o codigo de 6 digitos.");

export const signUpSchema = z.object({
  name: z.string().trim().min(2, "Nome precisa ter pelo menos 2 caracteres.").max(50),
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const signInSchema = z.object({
  identifier: z.string().trim().min(3, "Informe seu e-mail ou username."),
  password: passwordSchema,
});

export const verifyEmailOtpSchema = z.object({
  email: emailSchema,
  otp: otpSchema,
});

export const requestPasswordResetOtpSchema = z.object({
  email: emailSchema,
});

export const resetPasswordOtpSchema = z
  .object({
    email: emailSchema,
    otp: otpSchema,
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "As senhas nao conferem.",
  });

export const changePasswordSchema = z
  .object({
    currentPassword: passwordSchema,
    newPassword: passwordSchema,
    confirmPassword: passwordSchema,
    revokeOtherSessions: z.boolean().default(true),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "As senhas nao conferem.",
  });

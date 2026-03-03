"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Controller, useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { z } from "zod";

import { authClient } from "@/lib/auth/client";
import { requestPasswordResetOtpSchema, resetPasswordOtpSchema } from "@/lib/validation/auth";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Spinner } from "@/components/ui/spinner";

type ResetPasswordFormValues = z.infer<typeof resetPasswordOtpSchema>;

type ResetPasswordFormProps = {
  initialEmail?: string;
};

const RESEND_COOLDOWN_SECONDS = 60;

export function ResetPasswordForm({ initialEmail = "" }: ResetPasswordFormProps) {
  const router = useRouter();
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordOtpSchema),
    defaultValues: {
      email: initialEmail,
      otp: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (resendCooldown <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setResendCooldown((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  async function onSubmit(values: ResetPasswordFormValues) {
    form.clearErrors("root");
    setInfoMessage(null);

    const payload = {
      email: values.email.trim().toLowerCase(),
      otp: values.otp.trim(),
      password: values.password,
    };

    const response = await authClient.emailOtp.resetPassword(payload);

    if (response.error) {
      form.setError("root", {
        message: response.error.message ?? "Nao foi possivel redefinir a senha.",
      });
      return;
    }

    router.replace("/login?reset=success");
    router.refresh();
  }

  async function onResend() {
    form.clearErrors("root");
    setInfoMessage(null);

    const email = form.getValues("email").trim().toLowerCase();
    const parsed = requestPasswordResetOtpSchema.safeParse({ email });

    if (!parsed.success) {
      form.setError("email", {
        message: parsed.error.flatten().fieldErrors.email?.[0] ?? "Informe um e-mail valido.",
      });
      return;
    }

    setIsResending(true);

    await authClient.emailOtp.requestPasswordReset({ email });

    setIsResending(false);
    setInfoMessage("Se o e-mail existir, enviaremos um novo codigo em instantes.");
    setResendCooldown(RESEND_COOLDOWN_SECONDS);
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-[28px] font-extrabold tracking-tight">Redefinir senha</h1>
        <p className="text-sm text-muted-foreground">Digite o codigo recebido e escolha sua nova senha.</p>
      </div>

      <form className="w-full" onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup className="gap-5">
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>E-mail</FieldLabel>
                <FieldContent>
                  <Input
                    id={field.name}
                    type="email"
                    autoComplete="email"
                    aria-invalid={fieldState.invalid}
                    placeholder="voce@exemplo.com"
                    disabled={isSubmitting || isResending}
                    {...field}
                  />
                </FieldContent>
                {fieldState.error ? <FieldError>{fieldState.error.message}</FieldError> : null}
              </Field>
            )}
          />

          <Controller
            name="otp"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Codigo</FieldLabel>
                <FieldContent>
                  <InputOTP
                    id={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    maxLength={6}
                    pattern={REGEXP_ONLY_DIGITS}
                    autoFocus
                    disabled={isSubmitting || isResending}
                    aria-invalid={fieldState.invalid}
                    containerClassName="justify-start"
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </FieldContent>
                <FieldDescription>Codigo com validade de 5 minutos.</FieldDescription>
                {fieldState.error ? <FieldError>{fieldState.error.message}</FieldError> : null}
              </Field>
            )}
          />

          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Nova senha</FieldLabel>
                <FieldContent>
                  <Input
                    id={field.name}
                    type="password"
                    autoComplete="new-password"
                    aria-invalid={fieldState.invalid}
                    placeholder="••••••••"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FieldContent>
                {fieldState.error ? <FieldError>{fieldState.error.message}</FieldError> : null}
              </Field>
            )}
          />

          <Controller
            name="confirmPassword"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Confirmar nova senha</FieldLabel>
                <FieldContent>
                  <Input
                    id={field.name}
                    type="password"
                    autoComplete="new-password"
                    aria-invalid={fieldState.invalid}
                    placeholder="••••••••"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FieldContent>
                {fieldState.error ? <FieldError>{fieldState.error.message}</FieldError> : null}
              </Field>
            )}
          />

          {infoMessage ? <FieldDescription>{infoMessage}</FieldDescription> : null}
          {form.formState.errors.root?.message ? <FieldError>{form.formState.errors.root.message}</FieldError> : null}

          <Button className="w-full rounded-full text-base font-bold" size="lg" disabled={isSubmitting} type="submit">
            {isSubmitting ? <Spinner /> : "Atualizar senha"}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full rounded-full"
            disabled={isResending || resendCooldown > 0 || isSubmitting}
            onClick={onResend}
          >
            {isResending ? <Spinner /> : resendCooldown > 0 ? `Reenviar em ${resendCooldown}s` : "Reenviar codigo"}
          </Button>

          <p className="text-center text-[14px] text-muted-foreground">
            Lembrou sua senha?{" "}
            <Link className="font-semibold text-foreground hover:underline" href="/login">
              Voltar para login
            </Link>
          </p>
        </FieldGroup>
      </form>
    </div>
  );
}

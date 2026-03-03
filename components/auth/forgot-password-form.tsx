"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";

import { authClient } from "@/lib/auth/client";
import { requestPasswordResetOtpSchema } from "@/lib/validation/auth";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

type ForgotPasswordFormValues = z.infer<typeof requestPasswordResetOtpSchema>;

export function ForgotPasswordForm() {
  const router = useRouter();

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(requestPasswordResetOtpSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: ForgotPasswordFormValues) {
    form.clearErrors("root");

    const email = values.email.trim().toLowerCase();

    await authClient.emailOtp.requestPasswordReset({
      email,
    });

    router.push(`/forgot-password/reset?email=${encodeURIComponent(email)}`);
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-[28px] font-extrabold tracking-tight">Esqueci minha senha</h1>
        <p className="text-sm text-muted-foreground">
          Informe seu e-mail e enviaremos um codigo para redefinir sua senha.
        </p>
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
                    disabled={isSubmitting}
                    {...field}
                  />
                </FieldContent>
                <FieldDescription>
                  Por seguranca, sempre mostramos a mesma resposta, mesmo que o e-mail nao exista.
                </FieldDescription>
                {fieldState.error ? <FieldError>{fieldState.error.message}</FieldError> : null}
              </Field>
            )}
          />

          {form.formState.errors.root?.message ? <FieldError>{form.formState.errors.root.message}</FieldError> : null}

          <Button className="w-full rounded-full text-base font-bold" size="lg" disabled={isSubmitting} type="submit">
            {isSubmitting ? <Spinner /> : "Enviar codigo"}
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

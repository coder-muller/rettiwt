"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { authClient } from "@/lib/auth/client";
import { checkPasswordCompromisedWithApi } from "@/lib/security/password-leak-client";
import { signInSchema } from "@/lib/validation/auth";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

type SignInFormValues = {
  identifier: string;
  password: string;
};

type PasswordRiskState = "idle" | "checking" | "compromised" | "safe" | "unavailable";

function isEmail(value: string) {
  return value.includes("@");
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [passwordRisk, setPasswordRisk] = useState<PasswordRiskState>("idle");
  const [leakCount, setLeakCount] = useState<number | null>(null);

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { identifier: "", password: "" },
  });

  async function onSubmit(values: SignInFormValues) {
    form.clearErrors("root");

    const identifier = values.identifier.trim();
    const password = values.password;

    setPasswordRisk("checking");
    setLeakCount(null);

    const riskPromise = checkPasswordCompromisedWithApi(password);

    if (isEmail(identifier) && !isValidEmail(identifier)) {
      form.setError("identifier", { message: "Informe um e-mail valido ou username." });
      setPasswordRisk("idle");
      return;
    }

    const response = isEmail(identifier)
      ? await authClient.signIn.email({
          email: identifier.toLowerCase(),
          password,
          callbackURL: `${window.location.origin}/feed`,
        })
      : await authClient.signIn.username({
          username: identifier.toLowerCase(),
          password,
          callbackURL: `${window.location.origin}/feed`,
        });

    if (response.error) {
      form.setError("root", {
        message: response.error.message ?? "Falha ao entrar. Verifique suas credenciais.",
      });
      const riskResult = await riskPromise;
      if (riskResult.checkFailed) {
        setPasswordRisk("unavailable");
      } else if (riskResult.compromised) {
        setPasswordRisk("compromised");
        setLeakCount(riskResult.count ?? null);
      } else {
        setPasswordRisk("safe");
      }
      return;
    }

    const riskResult = await riskPromise;
    if (riskResult.checkFailed) {
      setPasswordRisk("unavailable");
    } else if (riskResult.compromised) {
      setPasswordRisk("compromised");
      setLeakCount(riskResult.count ?? null);
    } else {
      setPasswordRisk("safe");
    }

    const user = response.data?.user;

    if (user && !user.emailVerified) {
      router.replace(`/verify-email?email=${encodeURIComponent(user.email)}`);
      router.refresh();
      return;
    }

    const feedPath = riskResult.compromised ? "/feed?security=pwned-password" : "/feed";
    router.replace(feedPath);
    router.refresh();
  }

  const isSubmitting = form.formState.isSubmitting;
  const hasResetSuccess = searchParams.get("reset") === "success";

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-[28px] font-extrabold tracking-tight">Entrar no Rettiwt</h1>
      </div>

      <form className="w-full" onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup className="gap-5">
          {hasResetSuccess ? (
            <FieldDescription>Sua senha foi redefinida. Voce ja pode entrar com a nova senha.</FieldDescription>
          ) : null}

          <Controller
            name="identifier"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>E-mail ou username</FieldLabel>
                <FieldContent>
                  <Input
                    id={field.name}
                    autoComplete="username"
                    aria-invalid={fieldState.invalid}
                    placeholder="email@exemplo.com ou seu_username"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FieldContent>
                {fieldState.error ? <FieldError>{fieldState.error.message}</FieldError> : null}
              </Field>
            )}
          />

          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Senha</FieldLabel>
                <FieldContent>
                  <Input
                    id={field.name}
                    type="password"
                    autoComplete="current-password"
                    aria-invalid={fieldState.invalid}
                    disabled={isSubmitting}
                    placeholder="••••••••"
                    {...field}
                    onChange={(event) => {
                      field.onChange(event);
                      setPasswordRisk("idle");
                      setLeakCount(null);
                    }}
                  />
                </FieldContent>
                {fieldState.error ? <FieldError>{fieldState.error.message}</FieldError> : null}
                {!fieldState.error && passwordRisk === "checking" ? (
                  <FieldDescription>Verificando seguranca da senha...</FieldDescription>
                ) : null}
                {!fieldState.error && passwordRisk === "compromised" ? (
                  <FieldDescription>
                    Essa senha apareceu em vazamentos conhecidos
                    {typeof leakCount === "number" ? ` (${leakCount} ocorrencias).` : "."} Recomendamos trocar por
                    uma senha unica.
                  </FieldDescription>
                ) : null}
                {!fieldState.error && passwordRisk === "unavailable" ? (
                  <FieldDescription>Nao foi possivel verificar vazamentos agora.</FieldDescription>
                ) : null}
              </Field>
            )}
          />

          <div className="-mt-2 text-right">
            <Link className="text-[14px] font-semibold text-foreground hover:underline" href="/forgot-password">
              Esqueci minha senha
            </Link>
          </div>

          {form.formState.errors.root?.message ? (
            <FieldError>{form.formState.errors.root.message}</FieldError>
          ) : null}

          <Button
            className="w-full rounded-full text-base font-bold"
            size="lg"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? <Spinner /> : "Entrar"}
          </Button>

          <p className="text-center text-[15px] text-muted-foreground">
            Ainda nao tem conta?{" "}
            <Link className="font-bold text-foreground hover:underline" href="/register">
              Criar conta
            </Link>
          </p>
        </FieldGroup>
      </form>
    </div>
  );
}

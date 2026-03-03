"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth/client";
import { signInSchema } from "@/lib/validation/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

type SignInFormValues = {
  identifier: string;
  password: string;
};

function isEmail(value: string) {
  return value.includes("@");
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function LoginForm() {
  const router = useRouter();

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  async function onSubmit(values: SignInFormValues) {
    form.clearErrors("root");

    const identifier = values.identifier.trim();
    const password = values.password;

    if (isEmail(identifier) && !isValidEmail(identifier)) {
      form.setError("identifier", {
        message: "Informe um e-mail valido ou username.",
      });
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
      return;
    }

    router.replace("/feed");
    router.refresh();
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Card className="w-full border-border/80 bg-card shadow-sm">
      <CardHeader className="space-y-2">
        <CardTitle className="text-balance text-2xl">Entrar</CardTitle>
        <CardDescription className="text-pretty">
          Use e-mail ou username para acessar sua conta.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="w-full" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="gap-4">
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
                    />
                  </FieldContent>
                  {fieldState.error ? <FieldError>{fieldState.error.message}</FieldError> : null}
                </Field>
              )}
            />

            {form.formState.errors.root?.message ? (
              <FieldError>{form.formState.errors.root.message}</FieldError>
            ) : null}

            <Button className="w-full" disabled={isSubmitting} type="submit">
              {isSubmitting ? <Spinner /> : "Entrar"}
            </Button>

            <p className="text-sm text-muted-foreground">
              Ainda nao tem conta?{" "}
              <Link className="font-medium text-foreground underline underline-offset-4" href="/register">
                Criar conta
              </Link>
            </p>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}

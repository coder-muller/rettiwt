"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { authClient } from "@/lib/auth/client";
import { signUpSchema } from "@/lib/validation/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

type SignUpFormValues = {
  name: string;
  username: string;
  email: string;
  password: string;
};

export function RegisterForm() {
  const router = useRouter();
  const [usernameState, setUsernameState] = useState<"idle" | "checking" | "available" | "taken">("idle");

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
    },
  });

  async function checkUsernameAvailability(rawValue: string) {
    const username = rawValue.trim().toLowerCase();

    if (username.length < 3) {
      setUsernameState("idle");
      return;
    }

    setUsernameState("checking");

    const result = await authClient.isUsernameAvailable({ username });

    if (result.error || !result.data?.available) {
      setUsernameState("taken");
      form.setError("username", {
        message: "Esse username nao esta disponivel.",
      });
      return;
    }

    setUsernameState("available");
    if (form.formState.errors.username) {
      form.clearErrors("username");
    }
  }

  async function onSubmit(values: SignUpFormValues) {
    form.clearErrors("root");

    const payload = {
      name: values.name.trim(),
      username: values.username.trim().toLowerCase(),
      email: values.email.trim().toLowerCase(),
      password: values.password,
    };

    const response = await authClient.signUp.email({
      name: payload.name,
      username: payload.username,
      email: payload.email,
      password: payload.password,
      callbackURL: `${window.location.origin}/feed`,
    });

    if (response.error) {
      const message = response.error.message ?? "Falha ao criar conta.";

      if (message.toLowerCase().includes("username")) {
        form.setError("username", { message: "Esse username nao esta disponivel." });
      } else if (message.toLowerCase().includes("email")) {
        form.setError("email", { message: "Esse e-mail ja esta cadastrado." });
      } else {
        form.setError("root", { message });
      }
      return;
    }

    router.replace("/feed");
    router.refresh();
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Card className="w-full border-border/80 bg-card shadow-sm">
      <CardHeader className="space-y-2">
        <CardTitle className="text-balance text-2xl">Criar conta</CardTitle>
        <CardDescription className="text-pretty">
          Escolha seu username e comece a publicar no Rettiwt.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="w-full" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="gap-4">
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Nome</FieldLabel>
                  <FieldContent>
                    <Input
                      id={field.name}
                      autoComplete="name"
                      aria-invalid={fieldState.invalid}
                      placeholder="Seu nome"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FieldContent>
                  {fieldState.error ? <FieldError>{fieldState.error.message}</FieldError> : null}
                </Field>
              )}
            />

            <Controller
              name="username"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Username</FieldLabel>
                  <FieldContent>
                    <Input
                      id={field.name}
                      autoComplete="username"
                      aria-invalid={fieldState.invalid}
                      placeholder="seu_username"
                      disabled={isSubmitting}
                      {...field}
                      onChange={(event) => {
                        field.onChange(event);
                        setUsernameState("idle");
                        if (form.formState.errors.username) {
                          form.clearErrors("username");
                        }
                      }}
                      onBlur={async (event) => {
                        field.onBlur();
                        await checkUsernameAvailability(event.target.value);
                      }}
                    />
                  </FieldContent>
                  {fieldState.error ? <FieldError>{fieldState.error.message}</FieldError> : null}
                  {!fieldState.error && usernameState === "checking" ? (
                    <FieldDescription>Verificando disponibilidade...</FieldDescription>
                  ) : null}
                  {!fieldState.error && usernameState === "available" ? (
                    <FieldDescription>Username disponivel.</FieldDescription>
                  ) : null}
                </Field>
              )}
            />

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

            {form.formState.errors.root?.message ? (
              <FieldError>{form.formState.errors.root.message}</FieldError>
            ) : null}

            <Button className="w-full" disabled={isSubmitting} type="submit">
              {isSubmitting ? <Spinner /> : "Criar conta"}
            </Button>

            <p className="text-sm text-muted-foreground">
              Ja tem conta?{" "}
              <Link className="font-medium text-foreground underline underline-offset-4" href="/login">
                Entrar
              </Link>
            </p>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}

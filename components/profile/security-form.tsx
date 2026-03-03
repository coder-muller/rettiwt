"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { authClient } from "@/lib/auth/client";
import { changePasswordSchema } from "@/lib/validation/auth";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

type SecurityFormValues = z.input<typeof changePasswordSchema>;

export function SecurityForm() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<SecurityFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      revokeOtherSessions: true,
    },
  });

  async function onSubmit(values: SecurityFormValues) {
    setSuccessMessage(null);
    form.clearErrors();

    const response = await authClient.changePassword({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
      revokeOtherSessions: values.revokeOtherSessions,
    });

    if (response.error) {
      form.setError("root", {
        message: response.error.message ?? "Nao foi possivel atualizar sua senha.",
      });
      return;
    }

    setSuccessMessage("Senha atualizada com sucesso.");
    toast.success("Senha atualizada com sucesso.");
    form.reset({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      revokeOtherSessions: values.revokeOtherSessions,
    });
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <div className="px-4 py-4">
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup className="gap-5">
          <Controller
            name="currentPassword"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Senha atual</FieldLabel>
                <FieldContent>
                  <Input
                    id={field.name}
                    type="password"
                    autoComplete="current-password"
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
            name="newPassword"
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

          <Controller
            name="revokeOtherSessions"
            control={form.control}
            render={({ field }) => (
              <Field orientation="horizontal">
                <Checkbox
                  id={field.name}
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                  disabled={isSubmitting}
                />
                <FieldContent>
                  <FieldLabel htmlFor={field.name}>Encerrar outras sessoes</FieldLabel>
                  <FieldDescription>
                    Finaliza sessoes ativas em outros dispositivos apos trocar a senha.
                  </FieldDescription>
                </FieldContent>
              </Field>
            )}
          />

          {successMessage ? <FieldDescription>{successMessage}</FieldDescription> : null}
          {form.formState.errors.root?.message ? <FieldError>{form.formState.errors.root.message}</FieldError> : null}

          <div className="flex justify-end border-t pt-4">
            <Button type="submit" disabled={isSubmitting} className="min-w-[180px] rounded-full font-bold">
              {isSubmitting ? <Spinner /> : "Atualizar senha"}
            </Button>
          </div>
        </FieldGroup>
      </form>
    </div>
  );
}

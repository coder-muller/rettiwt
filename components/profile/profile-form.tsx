"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";

import { updateProfileAction } from "@/lib/actions/profile";
import { updateProfileSchema } from "@/lib/validation/profile";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";

type ProfileFormProps = {
  initialValues: {
    name: string;
    username: string;
    bio: string;
    avatarUrl: string;
  };
};

type ProfileFormValues = z.infer<typeof updateProfileSchema>;

export function ProfileForm({ initialValues }: ProfileFormProps) {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: initialValues.name,
      username: initialValues.username,
      bio: initialValues.bio,
      avatarUrl: initialValues.avatarUrl ?? "",
    },
  });

  async function onSubmit(values: ProfileFormValues) {
    form.clearErrors();

    const result = await updateProfileAction({
      name: values.name,
      username: values.username,
      bio: values.bio,
      avatarUrl: values.avatarUrl,
    });

    if (result.status === "error") {
      const fieldErrors = result.fieldErrors ?? {};

      if (fieldErrors.name?.[0]) {
        form.setError("name", { message: fieldErrors.name[0] });
      }
      if (fieldErrors.username?.[0]) {
        form.setError("username", { message: fieldErrors.username[0] });
      }
      if (fieldErrors.bio?.[0]) {
        form.setError("bio", { message: fieldErrors.bio[0] });
      }
      if (fieldErrors.avatarUrl?.[0]) {
        form.setError("avatarUrl", { message: fieldErrors.avatarUrl[0] });
      }

      if (result.message && !Object.keys(fieldErrors).length) {
        form.setError("root", { message: result.message });
      }
      return;
    }

    form.reset({
      ...values,
      username: values.username.toLowerCase(),
    });
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <div className="px-4 py-4">
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup className="gap-5">
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Nome</FieldLabel>
                <FieldContent>
                  <Input
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    disabled={isSubmitting}
                    {...field}
                  />
                </FieldContent>
                {fieldState.error ? (
                  <FieldError>{fieldState.error.message}</FieldError>
                ) : null}
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
                    aria-invalid={fieldState.invalid}
                    autoComplete="username"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FieldContent>
                <FieldDescription>
                  Use letras, numeros, underscore e ponto.
                </FieldDescription>
                {fieldState.error ? (
                  <FieldError>{fieldState.error.message}</FieldError>
                ) : null}
              </Field>
            )}
          />

          <Controller
            name="bio"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Bio</FieldLabel>
                <FieldContent>
                  <Textarea
                    id={field.name}
                    className="min-h-24 resize-none"
                    maxLength={160}
                    aria-invalid={fieldState.invalid}
                    disabled={isSubmitting}
                    {...field}
                  />
                </FieldContent>
                {fieldState.error ? (
                  <FieldError>{fieldState.error.message}</FieldError>
                ) : null}
              </Field>
            )}
          />

          <Controller
            name="avatarUrl"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Avatar URL</FieldLabel>
                <FieldContent>
                  <Input
                    id={field.name}
                    type="url"
                    aria-invalid={fieldState.invalid}
                    disabled={isSubmitting}
                    {...field}
                  />
                </FieldContent>
                {fieldState.error ? (
                  <FieldError>{fieldState.error.message}</FieldError>
                ) : null}
              </Field>
            )}
          />

          {form.formState.errors.root?.message ? (
            <FieldError>{form.formState.errors.root.message}</FieldError>
          ) : null}

          <div className="flex justify-end border-t pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[140px] rounded-full font-bold"
            >
              {isSubmitting ? <Spinner /> : "Salvar"}
            </Button>
          </div>
        </FieldGroup>
      </form>
    </div>
  );
}

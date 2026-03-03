"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { createCommentAction } from "@/lib/actions/comments";
import { createCommentSchema } from "@/lib/validation/comment";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";

type CommentFormProps = {
  postId: string;
  parentCommentId?: string;
  placeholder?: string;
  submitLabel?: string;
  compact?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
};

type CommentFormValues = z.infer<typeof createCommentSchema>;

const COMMENT_CHAR_LIMIT = 500;

export function CommentForm({
  postId,
  parentCommentId,
  placeholder = "Escreva seu comentario",
  submitLabel = "Comentar",
  compact = false,
  onSuccess,
  onCancel,
}: CommentFormProps) {
  const form = useForm<CommentFormValues>({
    resolver: zodResolver(createCommentSchema),
    defaultValues: {
      postId,
      content: "",
      parentCommentId,
    },
  });

  const content = useWatch({
    control: form.control,
    name: "content",
    defaultValue: "",
  });
  const remaining = COMMENT_CHAR_LIMIT - content.length;

  async function onSubmit(values: CommentFormValues) {
    form.clearErrors();

    const result = await createCommentAction(values);

    if (result.status === "error") {
      const contentError = result.fieldErrors?.content?.[0];

      if (contentError) {
        form.setError("content", { message: contentError });
      }

      if (result.message && !contentError) {
        form.setError("root", { message: result.message });
      }

      return;
    }

    form.reset({
      postId,
      content: "",
      parentCommentId,
    });

    onSuccess?.();
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <form
      className={compact ? "rounded-xl border bg-muted/20 p-3" : "border-b px-4 py-4 sm:px-6"}
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FieldGroup className="gap-3">
        <Controller
          name="content"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name} className="sr-only">
                Comentar post
              </FieldLabel>
              <FieldContent>
                <Textarea
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  maxLength={COMMENT_CHAR_LIMIT}
                  disabled={isSubmitting}
                  placeholder={placeholder}
                  className={compact ? "min-h-16 resize-none text-sm" : "min-h-20 resize-none"}
                />
              </FieldContent>
              {fieldState.error ? <FieldError>{fieldState.error.message}</FieldError> : null}
            </Field>
          )}
        />

        {form.formState.errors.root?.message ? (
          <FieldError>{form.formState.errors.root.message}</FieldError>
        ) : null}

        <div className="flex items-center justify-between gap-2">
          <span className="text-xs tabular-nums text-muted-foreground">{remaining} restantes</span>
          <div className="flex items-center gap-2">
            {onCancel ? (
              <Button type="button" variant="ghost" size="sm" disabled={isSubmitting} onClick={onCancel}>
                Cancelar
              </Button>
            ) : null}
            <Button type="submit" disabled={isSubmitting || !content.trim()} className="rounded-full">
              {isSubmitting ? <Spinner /> : submitLabel}
            </Button>
          </div>
        </div>
      </FieldGroup>
    </form>
  );
}

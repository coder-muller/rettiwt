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
import { cn } from "@/lib/utils";

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
  placeholder = "Poste sua resposta",
  submitLabel = "Responder",
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
      className={cn(
        compact ? "rounded-xl border bg-muted/20 p-3" : "border-b px-4 py-3",
      )}
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
                  className={cn(
                    "resize-none",
                    compact
                      ? "min-h-16 text-[15px]"
                      : "min-h-[52px] border-0 px-0 text-[17px] shadow-none placeholder:text-muted-foreground/50 focus-visible:ring-0",
                  )}
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

        <div className="flex items-center justify-end gap-2">
          {content.length > 0 ? (
            <span className="mr-auto text-[13px] tabular-nums text-muted-foreground">
              {remaining}
            </span>
          ) : null}
          {onCancel ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isSubmitting}
              onClick={onCancel}
            >
              Cancelar
            </Button>
          ) : null}
          <Button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="rounded-full font-bold"
          >
            {isSubmitting ? <Spinner /> : submitLabel}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}

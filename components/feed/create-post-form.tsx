"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Controller, useForm, useWatch } from "react-hook-form";

import { createPostAction } from "@/lib/actions/posts";
import type { ActionState } from "@/lib/actions/action-state";
import { createPostSchema } from "@/lib/validation/post";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type CreatePostFormProps = {
  currentUser: {
    name: string;
    avatar: string | null;
  };
};

type CreatePostValues = z.infer<typeof createPostSchema>;

const POST_CHAR_LIMIT = 280;

function initials(name: string) {
  const parts = name.trim().split(" ").filter(Boolean);
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function CreatePostForm({ currentUser }: CreatePostFormProps) {
  const form = useForm<CreatePostValues>({
    resolver: zodResolver(createPostSchema),
    defaultValues: { content: "" },
  });

  const content = useWatch({
    control: form.control,
    name: "content",
    defaultValue: "",
  });
  const remaining = POST_CHAR_LIMIT - content.length;
  const isOverLimit = remaining < 0;

  async function onSubmit(values: CreatePostValues) {
    form.clearErrors();

    const result: ActionState = await createPostAction({
      content: values.content,
    });

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

    form.reset({ content: "" });
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <form className="border-b px-4 py-3" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="flex gap-3">
        <Avatar className="size-10 shrink-0">
          <AvatarImage alt={currentUser.name} src={currentUser.avatar ?? undefined} />
          <AvatarFallback>{initials(currentUser.name)}</AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <FieldGroup className="gap-0">
            <Controller
              name="content"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name} className="sr-only">
                    Conteudo do post
                  </FieldLabel>
                  <FieldContent>
                    <Textarea
                      {...field}
                      aria-invalid={fieldState.invalid}
                      placeholder="No que voce esta pensando?"
                      maxLength={POST_CHAR_LIMIT + 10}
                      disabled={isSubmitting}
                      className="min-h-[56px] resize-none border-0 px-0 text-xl shadow-none placeholder:text-muted-foreground/50 focus-visible:ring-0"
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

            <div className="flex items-center justify-end gap-3 border-t pt-3">
              {content.length > 0 ? (
                <span
                  className={cn(
                    "text-[13px] tabular-nums",
                    isOverLimit
                      ? "text-destructive"
                      : remaining <= 20
                        ? "text-amber-500"
                        : "text-muted-foreground",
                  )}
                >
                  {remaining}
                </span>
              ) : null}
              <Button
                type="submit"
                disabled={isSubmitting || !content.trim() || isOverLimit}
                className="min-w-[90px] rounded-full font-bold"
              >
                {isSubmitting ? <Spinner /> : "Publicar"}
              </Button>
            </div>
          </FieldGroup>
        </div>
      </div>
    </form>
  );
}

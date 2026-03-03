"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { sendMessageAction } from "@/lib/actions/messages";
import { sendMessageSchema } from "@/lib/validation/message";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";

type MessageComposerProps = {
  conversationId: string;
  onMessageSent?: (message: {
    id: string;
    content: string;
    createdAt: string;
    sender: {
      id: string;
      username: string;
      name: string;
      avatar: string | null;
    };
    isMine: boolean;
  }) => void;
};

type MessageComposerValues = z.infer<typeof sendMessageSchema>;

export function MessageComposer({ conversationId, onMessageSent }: MessageComposerProps) {
  const form = useForm<MessageComposerValues>({
    resolver: zodResolver(sendMessageSchema),
    defaultValues: {
      conversationId,
      content: "",
    },
  });

  const content = useWatch({
    control: form.control,
    name: "content",
    defaultValue: "",
  });

  async function onSubmit(values: MessageComposerValues) {
    form.clearErrors();

    const result = await sendMessageAction(values);

    if (result.status === "error") {
      const contentError = result.fieldErrors?.content?.[0];
      if (contentError) {
        form.setError("content", {
          message: contentError,
        });
      } else if (result.message) {
        form.setError("root", { message: result.message });
      }
      return;
    }

    form.reset({
      conversationId,
      content: "",
    });

    if (result.sentMessage && onMessageSent) {
      onMessageSent(result.sentMessage);
    }
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <form className="border-t bg-background px-4 py-3 sm:px-6" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup className="gap-3">
        <Controller
          name="content"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="gap-2">
              <FieldLabel htmlFor={field.name} className="sr-only">
                Escreva sua mensagem
              </FieldLabel>
              <FieldContent>
                <div className="flex items-end gap-2">
                  <Textarea
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    placeholder="Escreva uma mensagem"
                    className="min-h-11 max-h-28 resize-none rounded-2xl"
                    disabled={isSubmitting}
                  />

                  <Button
                    type="submit"
                    disabled={isSubmitting || !content.trim()}
                    className="h-11 shrink-0 rounded-full px-5"
                  >
                    {isSubmitting ? <Spinner /> : "Enviar"}
                  </Button>
                </div>
              </FieldContent>
              {fieldState.error ? <FieldError>{fieldState.error.message}</FieldError> : null}
            </Field>
          )}
        />

        {form.formState.errors.root?.message ? (
          <FieldError>{form.formState.errors.root.message}</FieldError>
        ) : null}

      </FieldGroup>
    </form>
  );
}

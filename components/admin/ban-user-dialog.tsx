"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Ban, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

import { banUserAction, unbanUserAction } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";

const banSchema = z.object({
  banReason: z.string().trim().max(500, "Motivo muito longo.").optional(),
  banExpiresInDays: z
    .string()
    .trim()
    .optional()
    .refine((value) => {
      if (!value) {
        return true;
      }

      const days = Number.parseInt(value, 10);
      return Number.isFinite(days) && days > 0 && days <= 3650;
    }, "Informe um numero de dias entre 1 e 3650."),
});

type BanFormValues = z.infer<typeof banSchema>;

type BanUserDialogProps = {
  userId: string;
  isBanned: boolean;
};

export function BanUserDialog({ userId, isBanned }: BanUserDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPendingUnban, startUnbanTransition] = useTransition();
  const form = useForm<BanFormValues>({
    resolver: zodResolver(banSchema),
    defaultValues: {
      banReason: "",
      banExpiresInDays: "",
    },
  });

  async function onSubmit(values: BanFormValues) {
    form.clearErrors("root");
    const days = values.banExpiresInDays ? Number.parseInt(values.banExpiresInDays, 10) : undefined;

    const result = await banUserAction({
      userId,
      banReason: values.banReason?.trim() || undefined,
      banExpiresIn: typeof days === "number" && Number.isFinite(days) ? days * 24 * 60 * 60 : undefined,
    });

    if (result.status === "error") {
      const dayError = result.fieldErrors?.banExpiresIn?.[0];
      if (dayError) {
        form.setError("banExpiresInDays", {
          message: dayError,
        });
      }

      if (result.message) {
        form.setError("root", {
          message: result.message,
        });
      }
      return;
    }

    setOpen(false);
    form.reset();
    router.refresh();
  }

  if (isBanned) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          startUnbanTransition(async () => {
            await unbanUserAction({
              userId,
            });
            router.refresh();
          });
        }}
        disabled={isPendingUnban}
      >
        {isPendingUnban ? <Spinner /> : <ShieldCheck className="size-4" />}
        Desbanir
      </Button>
    );
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <Ban className="size-4" />
          Banir
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Banir usuario</DialogTitle>
          <DialogDescription>
            O usuario perdera acesso imediato. Defina um motivo e, se quiser, um prazo para expirar o banimento.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="banReason"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Motivo</FieldLabel>
                  <FieldContent>
                    <Textarea
                      {...field}
                      id={field.name}
                      placeholder="Descreva o motivo do banimento"
                      className="min-h-20 resize-none"
                      disabled={isSubmitting}
                    />
                  </FieldContent>
                  {fieldState.error ? <FieldError>{fieldState.error.message}</FieldError> : null}
                </Field>
              )}
            />

            <Controller
              name="banExpiresInDays"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Expira em (dias)</FieldLabel>
                  <FieldContent>
                    <Input
                      {...field}
                      id={field.name}
                      inputMode="numeric"
                      placeholder="Vazio = permanente"
                      disabled={isSubmitting}
                    />
                  </FieldContent>
                  <FieldDescription>Opcional. Se vazio, o banimento nao expira automaticamente.</FieldDescription>
                  {fieldState.error ? <FieldError>{fieldState.error.message}</FieldError> : null}
                </Field>
              )}
            />
          </FieldGroup>

          {form.formState.errors.root?.message ? (
            <FieldError>{form.formState.errors.root.message}</FieldError>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" variant="destructive" disabled={isSubmitting}>
              {isSubmitting ? <Spinner /> : "Confirmar banimento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

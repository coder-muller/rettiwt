"use client";

import { Trash2 } from "lucide-react";

import { deleteCommentAction } from "@/lib/actions/comments";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type DeleteCommentButtonProps = {
  commentId: string;
};

export function DeleteCommentButton({ commentId }: DeleteCommentButtonProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Excluir comentario">
          <Trash2 className="size-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir comentario?</AlertDialogTitle>
          <AlertDialogDescription>
            Essa acao nao pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form action={deleteCommentAction}>
          <input type="hidden" name="commentId" value={commentId} />
          <AlertDialogFooter>
            <AlertDialogCancel type="button">Cancelar</AlertDialogCancel>
            <AlertDialogAction type="submit" variant="destructive">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

import { DeleteCommentButton } from "@/components/comments/delete-comment-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { CommentView } from "@/lib/types/domain";

function initials(name: string) {
  const parts = name.trim().split(" ").filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("");
}

type CommentListProps = {
  comments: CommentView[];
  emptyTitle?: string;
};

export function CommentList({ comments, emptyTitle = "Nenhum comentario ainda." }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="px-4 py-10 text-center sm:px-6">
        <p className="text-sm text-muted-foreground">{emptyTitle}</p>
      </div>
    );
  }

  return (
    <div>
      {comments.map((comment) => (
        <article key={comment.id} className="border-b px-4 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <Link href={`/u/${comment.author.username}`} className="flex min-w-0 items-center gap-3">
              <Avatar className="size-8 border">
                <AvatarImage alt={comment.author.name} src={comment.author.avatar ?? undefined} />
                <AvatarFallback>{initials(comment.author.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{comment.author.name}</p>
                <p className="truncate text-xs text-muted-foreground">@{comment.author.username}</p>
              </div>
            </Link>

            <div className="flex items-center gap-1">
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(comment.createdAt, {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </p>
              {comment.canDelete ? <DeleteCommentButton commentId={comment.id} /> : null}
            </div>
          </div>

          {comment.deletedAt ? (
            <p className="mt-3 text-sm italic text-muted-foreground">Comentario removido.</p>
          ) : (
            <p className="mt-3 whitespace-pre-line break-words text-sm leading-6">{comment.content}</p>
          )}
        </article>
      ))}
    </div>
  );
}

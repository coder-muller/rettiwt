"use client";

import Link from "next/link";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MessageCircleReply } from "lucide-react";

import { CommentForm } from "@/components/comments/comment-form";
import { DeleteCommentButton } from "@/components/comments/delete-comment-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CommentView } from "@/lib/types/domain";

function initials(name: string) {
  const parts = name.trim().split(" ").filter(Boolean);
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

type CommentListProps = {
  postId: string;
  comments: CommentView[];
  emptyTitle?: string;
};

type CommentItemProps = {
  postId: string;
  comment: CommentView;
  depth: number;
};

function CommentItem({ postId, comment, depth }: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false);
  const replies = comment.replies ?? [];
  const hasReplies = replies.length > 0;
  const isNested = depth > 0;

  return (
    <article className={cn("px-4 py-4 sm:px-6", depth === 0 && "border-b", isNested && "pl-0 sm:pl-0")}>
      <div className={cn("flex gap-3", isNested && "pl-4")}>
        <div className="relative flex shrink-0 flex-col items-center">
          <Avatar className="size-8 border">
            <AvatarImage alt={comment.author.name} src={comment.author.avatar ?? undefined} />
            <AvatarFallback>{initials(comment.author.name)}</AvatarFallback>
          </Avatar>
          {hasReplies ? <span className="mt-2 h-full w-px bg-border" /> : null}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <Link href={`/u/${comment.author.username}`} className="min-w-0">
              <p className="truncate text-sm font-semibold leading-5">{comment.author.name}</p>
              <p className="truncate text-xs text-muted-foreground">@{comment.author.username}</p>
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
            <p className="mt-2 text-sm italic text-muted-foreground">Comentario removido.</p>
          ) : (
            <p className="mt-2 whitespace-pre-line break-words text-sm leading-6">{comment.content}</p>
          )}

          {!comment.deletedAt ? (
            <div className="mt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 rounded-full px-2 text-xs text-muted-foreground"
                onClick={() => setIsReplying((current) => !current)}
              >
                <MessageCircleReply className="size-4" />
                Responder
              </Button>
            </div>
          ) : null}

          {isReplying ? (
            <div className="mt-3">
              <CommentForm
                postId={postId}
                parentCommentId={comment.id}
                compact
                placeholder={`Responder para @${comment.author.username}`}
                submitLabel="Responder"
                onSuccess={() => setIsReplying(false)}
                onCancel={() => setIsReplying(false)}
              />
            </div>
          ) : null}

          {hasReplies ? (
            <div className="mt-2 border-l border-border/80">
              {replies.map((reply) => (
                <CommentItem key={reply.id} postId={postId} comment={reply} depth={depth + 1} />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function CommentList({ postId, comments, emptyTitle = "Nenhum comentario ainda." }: CommentListProps) {
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
        <CommentItem key={comment.id} postId={postId} comment={comment} depth={0} />
      ))}
    </div>
  );
}

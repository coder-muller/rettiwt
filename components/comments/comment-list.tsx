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

  return (
    <article className={cn("px-4 py-3", depth === 0 && "border-b")}>
      <div className={cn("flex gap-3", depth > 0 && "pl-4")}>
        <div className="relative flex shrink-0 flex-col items-center">
          <Link href={`/u/${comment.author.username}`}>
            <Avatar className="size-8">
              <AvatarImage
                alt={comment.author.name}
                src={comment.author.avatar ?? undefined}
              />
              <AvatarFallback>{initials(comment.author.name)}</AvatarFallback>
            </Avatar>
          </Link>
          {hasReplies ? <span className="mt-1 h-full w-0.5 bg-border" /> : null}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <Link
              href={`/u/${comment.author.username}`}
              className="flex min-w-0 items-center gap-1"
            >
              <span className="truncate text-[15px] font-bold hover:underline">
                {comment.author.name}
              </span>
              <span className="text-[13px] text-muted-foreground">
                @{comment.author.username}
              </span>
            </Link>
            <span className="text-muted-foreground">&middot;</span>
            <span className="text-[13px] text-muted-foreground">
              {formatDistanceToNow(comment.createdAt, {
                addSuffix: false,
                locale: ptBR,
              })}
            </span>
            {comment.canDelete ? (
              <div className="ml-auto">
                <DeleteCommentButton commentId={comment.id} />
              </div>
            ) : null}
          </div>

          {comment.deletedAt ? (
            <p className="mt-0.5 text-[15px] italic text-muted-foreground">
              Comentario removido.
            </p>
          ) : (
            <p className="mt-0.5 whitespace-pre-line wrap-break-word text-[15px] leading-5">
              {comment.content}
            </p>
          )}

          {!comment.deletedAt ? (
            <div className="-ml-2 mt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 rounded-full px-2 text-[13px] text-muted-foreground hover:bg-sky-500/10 hover:text-sky-500"
                onClick={() => setIsReplying((current) => !current)}
              >
                <MessageCircleReply className="size-4" />
                Responder
              </Button>
            </div>
          ) : null}

          {isReplying ? (
            <div className="mt-2">
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
            <div className="mt-1">
              {replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  postId={postId}
                  comment={reply}
                  depth={depth + 1}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function CommentList({
  postId,
  comments,
  emptyTitle = "Nenhum comentario ainda.",
}: CommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-[15px] text-muted-foreground">{emptyTitle}</p>
      </div>
    );
  }

  return (
    <div>
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          postId={postId}
          comment={comment}
          depth={0}
        />
      ))}
    </div>
  );
}

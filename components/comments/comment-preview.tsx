import Link from "next/link";

import type { CommentView } from "@/lib/types/domain";

type CommentPreviewProps = {
  postId: string;
  commentCount: number;
  comments: CommentView[];
};

export function CommentPreview({ postId, commentCount, comments }: CommentPreviewProps) {
  if (commentCount === 0) {
    return null;
  }

  return (
    <div className="mt-2 space-y-1.5 border-l-2 border-border/60 pl-3">
      {comments.map((comment) => (
        <p key={comment.id} className="text-[13px] leading-4">
          <Link
            href={`/u/${comment.author.username}`}
            className="font-bold hover:underline"
          >
            {comment.author.name}
          </Link>{" "}
          <span className="text-muted-foreground">
            {comment.deletedAt ? "Comentario removido." : comment.content}
          </span>
        </p>
      ))}

      <Link
        href={`/post/${postId}`}
        className="inline-block text-[13px] text-muted-foreground hover:underline"
      >
        Ver todos os {commentCount} comentarios
      </Link>
    </div>
  );
}

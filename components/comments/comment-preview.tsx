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
    <div className="mt-3 space-y-2 rounded-xl border bg-muted/30 p-3">
      {comments.map((comment) => (
        <div key={comment.id} className="text-sm">
          <Link href={`/u/${comment.author.username}`} className="font-medium hover:underline">
            @{comment.author.username}
          </Link>{" "}
          <span className="whitespace-pre-line break-words text-muted-foreground">
            {comment.deletedAt ? "Comentario removido." : comment.content}
          </span>
        </div>
      ))}

      <Link href={`/post/${postId}`} className="text-xs font-medium text-muted-foreground hover:text-foreground">
        Ver thread completa ({commentCount})
      </Link>
    </div>
  );
}

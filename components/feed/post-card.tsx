import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MessageCircle } from "lucide-react";

import { toggleLikeAction } from "@/lib/actions/posts";
import type { FeedPostView } from "@/lib/types/domain";
import { CommentPreview } from "@/components/comments/comment-preview";
import { FollowToggleButton } from "@/components/follow/follow-toggle-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DeletePostButton } from "@/components/feed/delete-post-button";
import { LikeButton } from "@/components/feed/like-button";
import { Button } from "@/components/ui/button";

function initials(name: string) {
  const parts = name.trim().split(" ").filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("");
}

type PostCardProps = {
  post: FeedPostView;
  showCommentPreview?: boolean;
  showAuthorFollow?: boolean;
};

export function PostCard({
  post,
  showCommentPreview = true,
  showAuthorFollow = false,
}: PostCardProps) {
  return (
    <article className="group border-b px-4 py-4 transition-colors hover:bg-muted/40 sm:px-6">
      <div className="flex items-start justify-between gap-3">
        <Link href={`/u/${post.author.username}`} className="flex min-w-0 items-center gap-3">
          <Avatar className="size-10 border">
            <AvatarImage alt={post.author.name} src={post.author.avatar ?? undefined} />
            <AvatarFallback>{initials(post.author.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{post.author.name}</p>
            <p className="truncate text-xs text-muted-foreground">@{post.author.username}</p>
          </div>
        </Link>

        <div className="flex items-center gap-1">
          {showAuthorFollow && !post.isOwner ? (
            <FollowToggleButton
              targetUserId={post.author.id}
              targetUsername={post.author.username}
              isFollowingByMe={post.author.isFollowedByMe}
            />
          ) : null}
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(post.createdAt, {
              addSuffix: true,
              locale: ptBR,
            })}
          </p>
          {post.isOwner ? (
            <div className="opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
              <DeletePostButton postId={post.id} />
            </div>
          ) : null}
        </div>
      </div>

      <p className="mt-3 whitespace-pre-line break-words text-sm leading-6">{post.content}</p>

      {showCommentPreview ? (
        <CommentPreview postId={post.id} commentCount={post.commentCount} comments={post.commentPreview} />
      ) : null}

      <div className="mt-2">
        <div className="flex items-center gap-1">
          <form action={toggleLikeAction}>
            <input type="hidden" name="postId" value={post.id} />
            <LikeButton likedByMe={post.likedByMe} likeCount={post.likeCount} />
          </form>

          <Button asChild variant="ghost" size="sm" className="h-8 rounded-full px-2 text-muted-foreground">
            <Link href={`/post/${post.id}`} aria-label="Abrir comentarios">
              <MessageCircle className="size-4" />
              <span className="tabular-nums">{post.commentCount}</span>
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

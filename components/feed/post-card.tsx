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
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
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
    <article className="group border-b px-4 py-3 transition-colors hover:bg-accent/30">
      <div className="flex gap-3">
        <Link href={`/u/${post.author.username}`} className="shrink-0">
          <Avatar className="size-10">
            <AvatarImage alt={post.author.name} src={post.author.avatar ?? undefined} />
            <AvatarFallback>{initials(post.author.name)}</AvatarFallback>
          </Avatar>
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <Link
              href={`/u/${post.author.username}`}
              className="flex min-w-0 items-center gap-1"
            >
              <span className="truncate text-[15px] font-bold hover:underline">
                {post.author.name}
              </span>
              <span className="shrink-0 text-[15px] text-muted-foreground">
                @{post.author.username}
              </span>
            </Link>
            <span className="text-[15px] text-muted-foreground">&middot;</span>
            <span className="shrink-0 text-[15px] text-muted-foreground">
              {formatDistanceToNow(post.createdAt, {
                addSuffix: false,
                locale: ptBR,
              })}
            </span>

            <div className="ml-auto flex items-center gap-1">
              {showAuthorFollow && !post.isOwner ? (
                <FollowToggleButton
                  targetUserId={post.author.id}
                  targetUsername={post.author.username}
                  isFollowingByMe={post.author.isFollowedByMe}
                />
              ) : null}
              {post.isOwner ? (
                <div className="opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                  <DeletePostButton postId={post.id} />
                </div>
              ) : null}
            </div>
          </div>

          <Link href={`/post/${post.id}`} className="block">
            <p className="mt-0.5 whitespace-pre-line wrap-break-word text-[15px] leading-5">
              {post.content}
            </p>
          </Link>

          {showCommentPreview ? (
            <CommentPreview
              postId={post.id}
              commentCount={post.commentCount}
              comments={post.commentPreview}
            />
          ) : null}

          <div className="-ml-2 mt-1.5 flex items-center gap-4">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 rounded-full px-2 text-muted-foreground hover:bg-sky-500/10 hover:text-sky-500"
            >
              <Link href={`/post/${post.id}`} aria-label="Abrir comentarios">
                <MessageCircle className="size-[18px]" />
                <span className="text-[13px] tabular-nums">
                  {post.commentCount || ""}
                </span>
              </Link>
            </Button>

            <form action={toggleLikeAction}>
              <input type="hidden" name="postId" value={post.id} />
              <LikeButton likedByMe={post.likedByMe} likeCount={post.likeCount} />
            </form>
          </div>
        </div>
      </div>
    </article>
  );
}

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

import { toggleLikeAction } from "@/lib/actions/posts";
import type { FeedPostView } from "@/lib/types/domain";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DeletePostButton } from "@/components/feed/delete-post-button";
import { LikeButton } from "@/components/feed/like-button";

function initials(name: string) {
  const parts = name.trim().split(" ").filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("");
}

type PostCardProps = {
  post: FeedPostView;
};

export function PostCard({ post }: PostCardProps) {
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

      <div className="mt-2">
        <form action={toggleLikeAction}>
          <input type="hidden" name="postId" value={post.id} />
          <LikeButton likedByMe={post.likedByMe} likeCount={post.likeCount} />
        </form>
      </div>
    </article>
  );
}

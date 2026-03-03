import type { FeedPostView } from "@/lib/types/domain";
import { PostCard } from "@/components/feed/post-card";

type PostListProps = {
  posts: FeedPostView[];
  emptyTitle: string;
  emptyDescription: string;
};

export function PostList({ posts, emptyTitle, emptyDescription }: PostListProps) {
  if (posts.length === 0) {
    return (
      <div className="px-6 py-16 text-center">
        <p className="text-base font-medium">{emptyTitle}</p>
        <p className="mt-1 text-sm text-muted-foreground">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

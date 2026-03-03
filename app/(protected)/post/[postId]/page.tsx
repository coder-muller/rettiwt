import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { CommentForm } from "@/components/comments/comment-form";
import { CommentList } from "@/components/comments/comment-list";
import { PostCard } from "@/components/feed/post-card";
import { requireSession } from "@/lib/auth/session";
import { commentService } from "@/lib/services/comment-service";
import { feedService } from "@/lib/services/feed-service";

type PostDetailPageProps = {
  params: Promise<{ postId: string }>;
};

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { postId } = await params;
  const session = await requireSession();

  const post = await feedService.getPostById(postId, session.user.id);

  if (!post) {
    notFound();
  }

  const comments = await commentService.listCommentsByPost(
    postId,
    session.user.id,
  );

  return (
    <section>
      <header className="sticky top-0 z-10 flex items-center gap-4 border-b bg-background/95 px-4 py-3 backdrop-blur">
        <Link
          href="/feed"
          className="rounded-full p-1.5 transition-colors hover:bg-accent"
          aria-label="Voltar"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="text-[17px] font-extrabold">Post</h1>
      </header>

      <PostCard post={post} showCommentPreview={false} />

      <CommentForm postId={postId} />

      <CommentList postId={postId} comments={comments} />
    </section>
  );
}

import { CreatePostForm } from "@/components/feed/create-post-form";
import { PostList } from "@/components/feed/post-list";
import { requireSession } from "@/lib/auth/session";
import { feedService } from "@/lib/services/feed-service";
import { profileService } from "@/lib/services/profile-service";

export default async function FeedPage() {
  const session = await requireSession();

  const profile = await profileService.ensureProfileForUser({
    id: session.user.id,
    name: session.user.name,
    image: session.user.image,
  });

  const posts = await feedService.listFeed(session.user.id);

  return (
    <section>
      <header className="sticky top-0 z-10 border-b bg-background/90 px-4 py-3 backdrop-blur sm:px-6">
        <h1 className="text-lg font-semibold">Para voce</h1>
      </header>

      <CreatePostForm
        currentUser={{
          name: profile.user.name,
          avatar: profile.avatarUrl ?? profile.user.image ?? null,
        }}
      />

      <PostList
        posts={posts}
        emptyTitle="Nenhum post ainda"
        emptyDescription="Publique o primeiro post para iniciar o feed."
      />
    </section>
  );
}

import { AlertTriangle } from "lucide-react";
import Link from "next/link";

import { CreatePostForm } from "@/components/feed/create-post-form";
import { PostList } from "@/components/feed/post-list";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { requireSession } from "@/lib/auth/session";
import { feedService } from "@/lib/services/feed-service";
import { profileService } from "@/lib/services/profile-service";

type FeedPageProps = {
  searchParams: Promise<{
    security?: string;
  }>;
};

export default async function FeedPage({ searchParams }: FeedPageProps) {
  const params = await searchParams;
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

      {params.security === "pwned-password" ? (
        <div className="border-b px-4 py-4 sm:px-6">
          <Alert>
            <AlertTriangle />
            <AlertTitle>Senha comprometida detectada</AlertTitle>
            <AlertDescription>
              Sua senha atual apareceu em vazamentos conhecidos. Troque por uma senha unica o quanto antes.
            </AlertDescription>
            <Button asChild type="button" variant="ghost" size="sm" className="mt-2 w-fit">
              <Link href="/feed">Dispensar</Link>
            </Button>
          </Alert>
        </div>
      ) : null}

      <PostList
        posts={posts}
        emptyTitle="Nenhum post ainda"
        emptyDescription="Publique o primeiro post para iniciar o feed."
      />
    </section>
  );
}

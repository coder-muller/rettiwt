import { AlertTriangle } from "lucide-react";
import Link from "next/link";

import { CreatePostForm } from "@/components/feed/create-post-form";
import { PostList } from "@/components/feed/post-list";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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

  const feed = await feedService.listFeed(session.user.id);

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

      <div className="border-b px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Seguindo</p>
            <p className="text-xs text-muted-foreground">Posts seus e de quem voce segue.</p>
          </div>
          <Badge variant="secondary" className="rounded-full">
            {feed.followingPosts.length}
          </Badge>
        </div>
      </div>

      <PostList
        posts={feed.followingPosts}
        emptyTitle="Sua timeline de seguindo esta vazia"
        emptyDescription="Siga perfis para ver mais posts nesta secao."
        showAuthorFollow
      />

      <div className="border-y bg-muted/20 px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Recomendados</p>
            <p className="text-xs text-muted-foreground">Descubra novos perfis e posts para seguir.</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="rounded-full">
              {feed.recommendedPosts.length}
            </Badge>
            <Button asChild variant="ghost" size="sm" className="rounded-full">
              <Link href="/search">Buscar pessoas</Link>
            </Button>
          </div>
        </div>
      </div>

      <PostList
        posts={feed.recommendedPosts}
        emptyTitle="Sem recomendacoes no momento"
        emptyDescription="Quando houver novos posts de perfis fora da sua rede, eles aparecerao aqui."
        showAuthorFollow
      />
    </section>
  );
}

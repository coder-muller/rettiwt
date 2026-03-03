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

  const feed = await feedService.listFeed(session.user.id);

  return (
    <section>
      <header className="sticky top-0 z-10 border-b bg-background/95 px-4 py-3 backdrop-blur">
        <h1 className="text-[17px] font-extrabold">Inicio</h1>
      </header>

      <CreatePostForm
        currentUser={{
          name: profile.user.name,
          avatar: profile.avatarUrl ?? profile.user.image ?? null,
        }}
      />

      {params.security === "pwned-password" ? (
        <div className="border-b px-4 py-4">
          <Alert>
            <AlertTriangle />
            <AlertTitle>Senha comprometida detectada</AlertTitle>
            <AlertDescription>
              Sua senha atual apareceu em vazamentos conhecidos. Troque por uma
              senha unica o quanto antes.
            </AlertDescription>
            <Button
              asChild
              type="button"
              variant="ghost"
              size="sm"
              className="mt-2 w-fit"
            >
              <Link href="/feed">Dispensar</Link>
            </Button>
          </Alert>
        </div>
      ) : null}

      {/* Following tab */}
      <div className="flex items-center border-b">
        <div className="flex-1 border-b-2 border-foreground py-3.5 text-center text-[15px] font-bold">
          Seguindo
        </div>
        <Link
          href="/search"
          className="flex-1 py-3.5 text-center text-[15px] text-muted-foreground transition-colors hover:bg-accent/50"
        >
          Recomendados
        </Link>
      </div>

      <PostList
        posts={feed.followingPosts}
        emptyTitle="Sua timeline esta vazia"
        emptyDescription="Siga perfis para ver posts aqui."
        showAuthorFollow
      />

      {feed.recommendedPosts.length > 0 ? (
        <>
          <div className="border-b border-t-4 border-t-border/50 px-4 py-3">
            <p className="text-[15px] font-extrabold">Descubra</p>
            <p className="text-[13px] text-muted-foreground">
              Posts de perfis que voce ainda nao segue.
            </p>
          </div>

          <PostList
            posts={feed.recommendedPosts}
            emptyTitle="Sem recomendacoes"
            emptyDescription="Quando houver novos posts, eles aparecerao aqui."
            showAuthorFollow
          />
        </>
      ) : null}
    </section>
  );
}

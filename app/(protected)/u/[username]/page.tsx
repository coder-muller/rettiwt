import Link from "next/link";
import { notFound } from "next/navigation";

import { PostList } from "@/components/feed/post-list";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { requireSession } from "@/lib/auth/session";
import { profileService } from "@/lib/services/profile-service";

function initials(name: string) {
  const parts = name.trim().split(" ").filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("");
}

type ProfilePageProps = {
  params: Promise<{ username: string }>;
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const session = await requireSession();

  const profile = await profileService.getProfileByUsername(username, session.user.id);

  if (!profile) {
    notFound();
  }

  const posts = await profileService.listPostsByUserId(profile.userId, session.user.id);

  return (
    <section>
      <header className="sticky top-0 z-10 border-b bg-background/90 px-4 py-3 backdrop-blur sm:px-6">
        <h1 className="truncate text-lg font-semibold">@{profile.username}</h1>
      </header>

      <div className="border-b px-4 py-5 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <Avatar className="size-14 border">
              <AvatarImage alt={profile.name} src={profile.avatar ?? undefined} />
              <AvatarFallback>{initials(profile.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h1 className="truncate text-balance text-xl font-semibold">{profile.name}</h1>
              <p className="truncate text-sm text-muted-foreground">@{profile.username}</p>
            </div>
          </div>

          {profile.isOwner ? (
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link href="/settings/profile">Editar perfil</Link>
            </Button>
          ) : null}
        </div>

        <p className="mt-4 whitespace-pre-line break-words text-sm leading-6 text-muted-foreground">
          {profile.bio || "Sem bio por enquanto."}
        </p>

        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="tabular-nums">{profile.postCount} posts</span>
          <span>
            Membro desde{" "}
            {new Intl.DateTimeFormat("pt-BR", {
              dateStyle: "medium",
            }).format(profile.joinedAt)}
          </span>
        </div>
      </div>

      <PostList
        posts={posts}
        emptyTitle="Sem posts ainda"
        emptyDescription="Quando este perfil publicar, os posts aparecerao aqui."
      />
    </section>
  );
}

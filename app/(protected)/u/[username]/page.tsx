import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays } from "lucide-react";

import { PostList } from "@/components/feed/post-list";
import { FollowToggleButton } from "@/components/follow/follow-toggle-button";
import { StartConversationButton } from "@/components/messages/start-conversation-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { requireSession } from "@/lib/auth/session";
import { profileService } from "@/lib/services/profile-service";

function initials(name: string) {
  const parts = name.trim().split(" ").filter(Boolean);
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

type ProfilePageProps = {
  params: Promise<{ username: string }>;
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const session = await requireSession();

  const profile = await profileService.getProfileByUsername(
    username,
    session.user.id,
  );

  if (!profile) {
    notFound();
  }

  const posts = await profileService.listPostsByUserId(
    profile.userId,
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
        <div className="min-w-0">
          <h1 className="truncate text-[17px] font-extrabold">
            {profile.name}
          </h1>
          <p className="text-[13px] text-muted-foreground">
            {profile.postCount} posts
          </p>
        </div>
      </header>

      {/* Profile info */}
      <div className="border-b px-4 py-4">
        <div className="flex items-start justify-between">
          <Avatar className="size-20 border-4 border-background">
            <AvatarImage
              alt={profile.name}
              src={profile.avatar ?? undefined}
            />
            <AvatarFallback className="text-xl">
              {initials(profile.name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex items-center gap-2">
            {profile.isOwner ? (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="rounded-full font-bold"
              >
                <Link href="/settings/profile">Editar perfil</Link>
              </Button>
            ) : (
              <>
                <FollowToggleButton
                  targetUserId={profile.userId}
                  targetUsername={profile.username}
                  isFollowingByMe={profile.isFollowingByMe}
                />
                {profile.canMessage ? (
                  <StartConversationButton targetUserId={profile.userId} />
                ) : null}
              </>
            )}
          </div>
        </div>

        <div className="mt-3">
          <h2 className="text-[20px] font-extrabold">{profile.name}</h2>
          <p className="text-[15px] text-muted-foreground">
            @{profile.username}
          </p>
        </div>

        {profile.bio ? (
          <p className="mt-3 whitespace-pre-line break-words text-[15px] leading-5">
            {profile.bio}
          </p>
        ) : null}

        <div className="mt-3 flex items-center gap-1.5 text-[15px] text-muted-foreground">
          <CalendarDays className="size-4" />
          <span>
            Entrou em{" "}
            {new Intl.DateTimeFormat("pt-BR", {
              month: "long",
              year: "numeric",
            }).format(profile.joinedAt)}
          </span>
        </div>

        <div className="mt-3 flex items-center gap-4 text-[15px]">
          <Link
            href={`/u/${profile.username}/following`}
            className="hover:underline"
          >
            <span className="font-bold">{profile.followingCount}</span>{" "}
            <span className="text-muted-foreground">seguindo</span>
          </Link>
          <Link
            href={`/u/${profile.username}/followers`}
            className="hover:underline"
          >
            <span className="font-bold">{profile.followerCount}</span>{" "}
            <span className="text-muted-foreground">seguidores</span>
          </Link>
        </div>
      </div>

      {/* Posts tab */}
      <div className="border-b">
        <div className="border-b-2 border-foreground px-4 py-3.5 text-center text-[15px] font-bold">
          Posts
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

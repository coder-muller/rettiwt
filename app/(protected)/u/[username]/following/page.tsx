import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { UserListItem } from "@/components/follow/user-list-item";
import { requireSession } from "@/lib/auth/session";
import { followService } from "@/lib/services/follow-service";

type FollowingPageProps = {
  params: Promise<{ username: string }>;
};

export default async function FollowingPage({ params }: FollowingPageProps) {
  const { username } = await params;
  const session = await requireSession();

  const result = await followService.listFollowing(username, session.user.id);

  if (!result) {
    notFound();
  }

  return (
    <section>
      <header className="sticky top-0 z-10 flex items-center gap-4 border-b bg-background/95 px-4 py-3 backdrop-blur">
        <Link
          href={`/u/${username}`}
          className="rounded-full p-1.5 transition-colors hover:bg-accent"
          aria-label="Voltar"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div className="min-w-0">
          <h1 className="text-[17px] font-extrabold">Seguindo</h1>
          <p className="text-[13px] text-muted-foreground">
            @{result.target.username}
          </p>
        </div>
      </header>

      {result.users.length === 0 ? (
        <div className="px-4 py-16 text-center">
          <p className="text-[15px] text-muted-foreground">
            Este perfil ainda nao segue ninguem.
          </p>
        </div>
      ) : (
        <div>
          {result.users.map((user) => (
            <UserListItem key={user.id} user={user} />
          ))}
        </div>
      )}
    </section>
  );
}

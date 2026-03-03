import { notFound } from "next/navigation";

import { UserListItem } from "@/components/follow/user-list-item";
import { requireSession } from "@/lib/auth/session";
import { followService } from "@/lib/services/follow-service";

type FollowersPageProps = {
  params: Promise<{ username: string }>;
};

export default async function FollowersPage({ params }: FollowersPageProps) {
  const { username } = await params;
  const session = await requireSession();

  const result = await followService.listFollowers(username, session.user.id);

  if (!result) {
    notFound();
  }

  return (
    <section>
      <header className="sticky top-0 z-10 border-b bg-background/90 px-4 py-3 backdrop-blur sm:px-6">
        <h1 className="text-lg font-semibold">Seguidores de @{result.target.username}</h1>
      </header>

      {result.users.length === 0 ? (
        <div className="px-4 py-16 text-center text-sm text-muted-foreground sm:px-6">
          Este perfil ainda nao possui seguidores.
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

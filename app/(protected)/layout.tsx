import Link from "next/link";

import { MainNav } from "@/components/layout/main-nav";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { requireSession } from "@/lib/auth/session";
import { profileService } from "@/lib/services/profile-service";

function initials(name: string) {
  const parts = name.split(" ").filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("");
}

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const profile = await profileService.ensureProfileForUser({
    id: session.user.id,
    name: session.user.name,
    image: session.user.image,
  });

  const username = profile.user.username;

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto grid min-h-dvh w-full max-w-7xl grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,700px)_minmax(320px,1fr)]">
        <aside className="hidden lg:flex lg:justify-end">
          <div className="sticky top-0 flex h-dvh w-full max-w-[300px] flex-col border-r px-4 py-3">
            <Link href="/feed" className="mb-4 px-3 text-2xl font-semibold">
              Rettiwt
            </Link>

            <MainNav username={username} />

            <div className="mt-auto rounded-2xl border bg-card p-3">
              <div className="mb-3 flex items-center gap-3">
                <Avatar className="size-10 border">
                  <AvatarImage alt={profile.user.name} src={profile.avatarUrl ?? profile.user.image ?? undefined} />
                  <AvatarFallback>{initials(profile.user.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{profile.user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">@{username}</p>
                </div>
              </div>
              <SignOutButton />
            </div>
          </div>
        </aside>

        <div className="min-w-0 border-x">
          <header className="sticky top-0 z-20 border-b bg-background/95 px-4 py-3 backdrop-blur lg:hidden">
            <div className="mx-auto flex w-full items-center justify-between">
              <Link href="/feed" className="text-lg font-semibold">
                Rettiwt
              </Link>
              <SignOutButton className="w-auto" />
            </div>
          </header>

          <main className="w-full pb-24 lg:pb-0">{children}</main>

          <div className="fixed inset-x-0 bottom-0 border-t bg-background/95 px-4 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 backdrop-blur lg:hidden">
            <MainNav username={username} mobile />
          </div>
        </div>
      </div>
    </div>
  );
}

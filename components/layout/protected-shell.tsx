"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LogoIcon } from "@/components/ui/logo-icon";
import { MainNav } from "@/components/layout/main-nav";
import { UserMenu } from "@/components/layout/user-menu";
import { cn } from "@/lib/utils";

type ProtectedShellProps = {
  username: string;
  userName: string;
  userAvatar: string | null;
  isAdmin: boolean;
  unreadNotifications: number;
  unreadMessages: number;
  children: React.ReactNode;
};

function RightRail() {
  return (
    <aside className="hidden xl:block">
      <div className="sticky top-0 space-y-4 p-4">
        <section className="rounded-2xl border bg-card p-4">
          <h2 className="text-[15px] font-extrabold">Descubra</h2>
          <div className="mt-3 grid gap-3 text-[15px]">
            <Link
              href="/search"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Buscar pessoas
            </Link>
            <Link
              href="/notifications"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Ver notificacoes
            </Link>
            <Link
              href="/messages"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Abrir mensagens
            </Link>
          </div>
        </section>
        <p className="px-1 text-xs text-muted-foreground">
          Rettiwt &copy; {new Date().getFullYear()}
        </p>
      </div>
    </aside>
  );
}

export function ProtectedShell({
  username,
  userName,
  userAvatar,
  isAdmin,
  unreadNotifications,
  unreadMessages,
  children,
}: ProtectedShellProps) {
  const pathname = usePathname() ?? "";
  const isMessagesRoute = pathname === "/messages" || pathname.startsWith("/messages/");

  return (
    <div className="min-h-dvh bg-background">
      <div
        className={cn(
          "mx-auto grid min-h-dvh w-full max-w-[1280px] grid-cols-1",
          "lg:grid-cols-[275px_minmax(0,1fr)]",
          !isMessagesRoute && "xl:grid-cols-[275px_minmax(0,600px)_minmax(290px,1fr)]",
          isMessagesRoute && "xl:grid-cols-[275px_minmax(0,1fr)]",
        )}
      >
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex lg:justify-end">
          <div className="sticky top-0 flex h-dvh w-full max-w-[275px] flex-col px-3 py-2">
            <Link
              href="/feed"
              className="mb-2 inline-flex size-[52px] items-center justify-center rounded-full transition-colors hover:bg-accent"
            >
              <LogoIcon className="size-7 text-foreground" title="Rettiwt" />
            </Link>

            <MainNav
              username={username}
              isAdmin={isAdmin}
              unreadNotifications={unreadNotifications}
              unreadMessages={unreadMessages}
            />

            <div className="mt-auto">
              <UserMenu
                username={username}
                userName={userName}
                userAvatar={userAvatar}
                isAdmin={isAdmin}
                variant="full"
              />
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="min-w-0 border-x">
          {/* Mobile header */}
          <header className="sticky top-0 z-20 border-b bg-background/95 px-4 py-2 backdrop-blur lg:hidden">
            <div className="mx-auto flex w-full items-center justify-between">
              <Link href="/feed" aria-label="Inicio">
                <LogoIcon className="size-7 text-foreground" title="Rettiwt" />
              </Link>
              <UserMenu
                username={username}
                userName={userName}
                userAvatar={userAvatar}
                isAdmin={isAdmin}
              />
            </div>
          </header>

          <main className="w-full pb-20 lg:pb-0">{children}</main>

          {/* Mobile bottom nav */}
          <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-background/95 px-2 pb-[calc(env(safe-area-inset-bottom)+0.25rem)] pt-1 backdrop-blur lg:hidden">
            <MainNav
              username={username}
              isAdmin={isAdmin}
              mobile
              unreadNotifications={unreadNotifications}
              unreadMessages={unreadMessages}
            />
          </div>
        </div>

        {!isMessagesRoute ? <RightRail /> : null}
      </div>
    </div>
  );
}

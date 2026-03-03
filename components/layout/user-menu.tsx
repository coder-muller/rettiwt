"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTheme } from "next-themes";
import { KeyRound, LogOut, Moon, MoreHorizontal, Settings, Shield, Sun, User } from "lucide-react";

import { authClient } from "@/lib/auth/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function initials(name: string) {
  const parts = name.split(" ").filter(Boolean);
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

type UserMenuProps = {
  username: string;
  userName: string;
  userAvatar: string | null;
  isAdmin?: boolean;
  variant?: "compact" | "full";
};

export function UserMenu({
  username,
  userName,
  userAvatar,
  isAdmin = false,
  variant = "compact",
}: UserMenuProps) {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [isPending, setIsPending] = useState(false);

  async function onSignOut() {
    setIsPending(true);
    await authClient.signOut();
    router.replace("/login");
    router.refresh();
  }

  const isDark = resolvedTheme === "dark";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {variant === "full" ? (
          <button
            type="button"
            className="flex w-full cursor-pointer items-center gap-3 rounded-full p-3 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Avatar className="size-10">
              <AvatarImage alt={userName} src={userAvatar ?? undefined} />
              <AvatarFallback>{initials(userName)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-[15px] font-bold">{userName}</p>
              <p className="truncate text-[13px] text-muted-foreground">@{username}</p>
            </div>
            <MoreHorizontal className="size-5 shrink-0 text-muted-foreground" />
          </button>
        ) : (
          <button
            type="button"
            className="cursor-pointer rounded-full p-0.5 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Avatar className="size-8">
              <AvatarImage alt={userName} src={userAvatar ?? undefined} />
              <AvatarFallback>{initials(userName)}</AvatarFallback>
            </Avatar>
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={variant === "full" ? "end" : "start"}
        side={variant === "full" ? "top" : "bottom"}
        className="w-64"
      >
        <div className="px-2 py-2">
          <p className="text-[15px] font-bold">{userName}</p>
          <p className="text-[13px] text-muted-foreground">@{username}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/u/${username}`}>
            <User className="size-4" />
            Perfil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings/profile">
            <Settings className="size-4" />
            Configuracoes
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings/security">
            <KeyRound className="size-4" />
            Seguranca
          </Link>
        </DropdownMenuItem>
        {isAdmin ? (
          <DropdownMenuItem asChild>
            <Link href="/admin/users">
              <Shield className="size-4" />
              Painel admin
            </Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem onClick={() => setTheme(isDark ? "light" : "dark")}>
          {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          {isDark ? "Tema claro" : "Tema escuro"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onSignOut}
          disabled={isPending}
          variant="destructive"
        >
          <LogOut className="size-4" />
          {isPending ? "Saindo..." : "Sair da conta"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

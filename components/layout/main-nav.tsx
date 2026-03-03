"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Settings, UserRound } from "lucide-react";

import { cn } from "@/lib/utils";

type MainNavProps = {
  username: string;
  mobile?: boolean;
};

const navItems = (username: string) => [
  { href: "/feed", label: "Feed", icon: Home },
  { href: `/u/${username}`, label: "Perfil", icon: UserRound },
  { href: "/settings/profile", label: "Config", icon: Settings },
];

export function MainNav({ username, mobile = false }: MainNavProps) {
  const pathname = usePathname();

  return (
    <nav className={cn("grid gap-1", mobile && "grid-cols-3")}>
      {navItems(username).map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "inline-flex items-center gap-4 rounded-full px-4 py-3 text-lg font-medium transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground",
              mobile && "justify-center rounded-md px-2 py-2 text-sm",
            )}
          >
            <Icon className="size-5" />
            <span className={cn(mobile && "sr-only")}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

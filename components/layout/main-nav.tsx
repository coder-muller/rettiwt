"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Home, Mail, Search, Settings, UserRound } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type MainNavProps = {
  username: string;
  mobile?: boolean;
  unreadNotifications?: number;
  unreadMessages?: number;
};

const navItems = (username: string) => [
  { href: "/feed", label: "Feed", icon: Home },
  { href: "/search", label: "Buscar", icon: Search },
  { href: "/notifications", label: "Notificacoes", icon: Bell },
  { href: "/messages", label: "Mensagens", icon: Mail },
  { href: `/u/${username}`, label: "Perfil", icon: UserRound },
  { href: "/settings/profile", label: "Config", icon: Settings },
];

function isItemActive(pathname: string, href: string) {
  if (href === "/messages") {
    return pathname === "/messages" || pathname.startsWith("/messages/");
  }

  if (href.startsWith("/u/")) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return pathname === href;
}

export function MainNav({
  username,
  mobile = false,
  unreadNotifications = 0,
  unreadMessages = 0,
}: MainNavProps) {
  const pathname = usePathname() ?? "";

  return (
    <nav className={cn("grid gap-1", mobile && "grid-cols-6")}>
      {navItems(username).map((item) => {
        const isActive = isItemActive(pathname, item.href);
        const Icon = item.icon;
        const showMessageBadge = item.href === "/messages" && unreadMessages > 0;
        const showNotificationBadge = item.href === "/notifications" && unreadNotifications > 0;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "inline-flex items-center gap-3 rounded-full px-4 py-3 text-base font-medium transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground",
              mobile && "justify-center rounded-md px-2 py-2 text-sm",
            )}
          >
            <Icon className="size-5" />
            <span className={cn(mobile && "sr-only")}>{item.label}</span>
            {showMessageBadge ? (
              <Badge className="rounded-full px-1.5 py-0 text-[10px]">
                {unreadMessages > 99 ? "99+" : unreadMessages}
              </Badge>
            ) : null}
            {showNotificationBadge ? (
              <Badge className="rounded-full px-1.5 py-0 text-[10px]">
                {unreadNotifications > 99 ? "99+" : unreadNotifications}
              </Badge>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

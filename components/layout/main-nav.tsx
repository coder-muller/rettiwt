"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Home, Mail, Search, Settings, Shield, UserRound } from "lucide-react";

import { cn } from "@/lib/utils";

type MainNavProps = {
  username: string;
  isAdmin?: boolean;
  mobile?: boolean;
  unreadNotifications?: number;
  unreadMessages?: number;
};

const desktopItems = (username: string, isAdmin: boolean) => {
  const items = [
    { href: "/feed", label: "Inicio", icon: Home },
    { href: "/search", label: "Buscar", icon: Search },
    { href: "/notifications", label: "Notificacoes", icon: Bell },
    { href: "/messages", label: "Mensagens", icon: Mail },
    { href: `/u/${username}`, label: "Perfil", icon: UserRound },
    { href: "/settings/profile", label: "Configuracoes", icon: Settings },
  ];

  if (isAdmin) {
    items.push({ href: "/admin/users", label: "Admin", icon: Shield });
  }

  return items;
};

const mobileItems = (username: string) => [
  { href: "/feed", label: "Inicio", icon: Home },
  { href: "/search", label: "Buscar", icon: Search },
  { href: "/notifications", label: "Notificacoes", icon: Bell },
  { href: "/messages", label: "Mensagens", icon: Mail },
  { href: `/u/${username}`, label: "Perfil", icon: UserRound },
];

function isItemActive(pathname: string, href: string) {
  if (href === "/messages") {
    return pathname === "/messages" || pathname.startsWith("/messages/");
  }

  if (href.startsWith("/u/")) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  if (href === "/settings/profile") {
    return pathname === "/settings/profile" || pathname === "/settings/security";
  }

  return pathname === href;
}

export function MainNav({
  username,
  isAdmin = false,
  mobile = false,
  unreadNotifications = 0,
  unreadMessages = 0,
}: MainNavProps) {
  const pathname = usePathname() ?? "";
  const items = mobile ? mobileItems(username) : desktopItems(username, isAdmin);

  if (mobile) {
    return (
      <nav className="flex items-center justify-around">
        {items.map((item) => {
          const isActive = isItemActive(pathname, item.href);
          const Icon = item.icon;
          const showBadge =
            (item.href === "/messages" && unreadMessages > 0) ||
            (item.href === "/notifications" && unreadNotifications > 0);
          const badgeCount = item.href === "/messages" ? unreadMessages : unreadNotifications;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center p-2"
              aria-label={item.label}
            >
              <Icon
                className={cn("size-[26px]", isActive ? "text-foreground" : "text-muted-foreground")}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              {showBadge ? (
                <span className="absolute right-0 top-0.5 flex size-[18px] items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {badgeCount > 9 ? "9+" : badgeCount}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="grid gap-0.5">
      {items.map((item) => {
        const isActive = isItemActive(pathname, item.href);
        const Icon = item.icon;
        const showBadge =
          (item.href === "/messages" && unreadMessages > 0) ||
          (item.href === "/notifications" && unreadNotifications > 0);
        const badgeCount = item.href === "/messages" ? unreadMessages : unreadNotifications;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "inline-flex items-center gap-5 rounded-full px-4 py-3 text-xl transition-colors hover:bg-accent",
              isActive ? "font-bold text-foreground" : "font-normal text-foreground",
            )}
          >
            <div className="relative">
              <Icon className="size-[26px]" strokeWidth={isActive ? 2.5 : 1.8} />
              {showBadge ? (
                <span className="absolute -right-1 -top-1 flex size-[18px] items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {badgeCount > 9 ? "9+" : badgeCount}
                </span>
              ) : null}
            </div>
            <span className="text-[20px]">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

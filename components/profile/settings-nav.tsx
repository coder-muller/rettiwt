"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const items = [
  {
    href: "/settings/profile",
    label: "Perfil",
  },
  {
    href: "/settings/security",
    label: "Seguranca",
  },
];

export function SettingsNav() {
  const pathname = usePathname() ?? "";

  return (
    <nav className="flex border-b">
      {items.map((item) => {
        const active = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex-1 border-b-2 px-4 py-3 text-center text-sm font-medium transition-colors hover:bg-accent/60",
              active ? "border-foreground text-foreground" : "border-transparent text-muted-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

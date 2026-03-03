"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  differenceInCalendarDays,
  formatDistanceToNow,
  isToday,
  isYesterday,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { Heart, MessageCircleReply, UserPlus } from "lucide-react";

import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/lib/actions/notifications";
import type { NotificationView } from "@/lib/types/domain";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function initials(name: string) {
  const parts = name.trim().split(" ").filter(Boolean);
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function getGroupLabel(value: Date) {
  if (isToday(value)) return "Hoje";
  if (isYesterday(value)) return "Ontem";
  const diff = differenceInCalendarDays(new Date(), value);
  if (diff <= 7) return "Esta semana";
  return "Anteriores";
}

function getNotificationActionLabel(notification: NotificationView) {
  if (notification.type === "POST_LIKED") return "curtiu seu post";
  if (notification.type === "POST_COMMENTED") return "comentou no seu post";
  if (notification.type === "COMMENT_REPLIED")
    return "respondeu seu comentario";
  return "comecou a seguir voce";
}

function getNotificationIcon(notification: NotificationView) {
  if (notification.type === "POST_LIKED") {
    return <Heart className="size-5 fill-rose-500 text-rose-500" />;
  }

  if (
    notification.type === "POST_COMMENTED" ||
    notification.type === "COMMENT_REPLIED"
  ) {
    return <MessageCircleReply className="size-5 text-sky-500" />;
  }

  return <UserPlus className="size-5 text-primary" />;
}

function getNotificationTargetHref(notification: NotificationView) {
  if (notification.postId) return `/post/${notification.postId}`;
  return `/u/${notification.actor.username}`;
}

type NotificationListProps = {
  notifications: NotificationView[];
};

type FilterMode = "all" | "unread";

export function NotificationList({ notifications }: NotificationListProps) {
  const [filter, setFilter] = useState<FilterMode>("all");
  const unreadCount = notifications.filter((n) => !n.readAt).length;

  const filteredNotifications = useMemo(() => {
    return filter === "all"
      ? notifications
      : notifications.filter((n) => !n.readAt);
  }, [filter, notifications]);

  const grouped = useMemo(() => {
    const groups = new Map<string, NotificationView[]>();
    for (const n of filteredNotifications) {
      const key = getGroupLabel(n.createdAt);
      const existing = groups.get(key) ?? [];
      existing.push(n);
      groups.set(key, existing);
    }
    return Array.from(groups.entries());
  }, [filteredNotifications]);

  return (
    <section>
      {/* X-style tab bar */}
      <div className="flex items-center border-b">
        <button
          type="button"
          className={cn(
            "flex-1 py-3.5 text-center text-[15px] font-medium transition-colors",
            filter === "all"
              ? "border-b-2 border-foreground font-bold text-foreground"
              : "text-muted-foreground hover:bg-accent/50",
          )}
          onClick={() => setFilter("all")}
        >
          Todas
        </button>
        <button
          type="button"
          className={cn(
            "flex-1 py-3.5 text-center text-[15px] font-medium transition-colors",
            filter === "unread"
              ? "border-b-2 border-foreground font-bold text-foreground"
              : "text-muted-foreground hover:bg-accent/50",
          )}
          onClick={() => setFilter("unread")}
        >
          Nao lidas{unreadCount > 0 ? ` (${unreadCount})` : ""}
        </button>
      </div>

      {unreadCount > 0 ? (
        <div className="border-b px-4 py-2">
          <form action={markAllNotificationsReadAction}>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-[13px] text-muted-foreground hover:text-foreground"
            >
              Marcar tudo como lido
            </Button>
          </form>
        </div>
      ) : null}

      {filteredNotifications.length === 0 ? (
        <div className="px-4 py-20 text-center">
          <p className="text-[20px] font-extrabold">
            {filter === "unread" ? "Tudo em dia!" : "Nada por aqui ainda"}
          </p>
          <p className="mt-1 text-[15px] text-muted-foreground">
            {filter === "unread"
              ? "Voce nao tem notificacoes nao lidas."
              : "Quando houver novas interacoes, elas aparecerao aqui."}
          </p>
        </div>
      ) : (
        <div>
          {grouped.map(([label, items]) => (
            <section key={label}>
              <div className="sticky top-[53px] z-10 border-b bg-background/95 px-4 py-2 backdrop-blur">
                <p className="text-[13px] font-bold text-muted-foreground">
                  {label}
                </p>
              </div>

              <div>
                {items.map((notification) => (
                  <article
                    key={notification.id}
                    className={cn(
                      "flex gap-3 border-b px-4 py-3 transition-colors hover:bg-accent/30",
                      !notification.readAt && "bg-accent/15",
                    )}
                  >
                    <div className="mt-0.5 shrink-0">
                      {getNotificationIcon(notification)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/u/${notification.actor.username}`}
                        className="inline-block"
                      >
                        <Avatar className="size-8">
                          <AvatarImage
                            alt={notification.actor.name}
                            src={notification.actor.avatar ?? undefined}
                          />
                          <AvatarFallback>
                            {initials(notification.actor.name)}
                          </AvatarFallback>
                        </Avatar>
                      </Link>

                      <p className="mt-1.5 text-[15px]">
                        <Link
                          href={`/u/${notification.actor.username}`}
                          className="font-bold hover:underline"
                        >
                          {notification.actor.name}
                        </Link>{" "}
                        <Link
                          href={getNotificationTargetHref(notification)}
                          className="text-muted-foreground hover:underline"
                        >
                          {getNotificationActionLabel(notification)}
                        </Link>
                      </p>

                      <p className="mt-0.5 text-[13px] text-muted-foreground">
                        {formatDistanceToNow(notification.createdAt, {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </p>
                    </div>

                    {!notification.readAt ? (
                      <div className="flex shrink-0 items-start gap-2">
                        <span
                          aria-label="Nao lida"
                          className="mt-2 inline-block size-2 rounded-full bg-primary"
                        />
                        <form action={markNotificationReadAction}>
                          <input
                            type="hidden"
                            name="notificationId"
                            value={notification.id}
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 rounded-full text-[12px]"
                          >
                            Lida
                          </Button>
                        </form>
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </section>
  );
}

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { differenceInCalendarDays, formatDistanceToNow, isToday, isYesterday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Heart, MessageCircleReply, UserPlus } from "lucide-react";

import { markAllNotificationsReadAction, markNotificationReadAction } from "@/lib/actions/notifications";
import type { NotificationView } from "@/lib/types/domain";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function initials(name: string) {
  const parts = name.trim().split(" ").filter(Boolean);
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function getGroupLabel(value: Date) {
  if (isToday(value)) {
    return "Hoje";
  }

  if (isYesterday(value)) {
    return "Ontem";
  }

  const diff = differenceInCalendarDays(new Date(), value);
  if (diff <= 7) {
    return "Esta semana";
  }

  return "Anteriores";
}

function getNotificationActionLabel(notification: NotificationView) {
  if (notification.type === "POST_LIKED") {
    return "curtiu seu post";
  }

  if (notification.type === "POST_COMMENTED") {
    return "comentou no seu post";
  }

  if (notification.type === "COMMENT_REPLIED") {
    return "respondeu seu comentario";
  }

  return "comecou a seguir voce";
}

function getNotificationIcon(notification: NotificationView) {
  if (notification.type === "POST_LIKED") {
    return <Heart className="size-4" />;
  }

  if (notification.type === "POST_COMMENTED" || notification.type === "COMMENT_REPLIED") {
    return <MessageCircleReply className="size-4" />;
  }

  return <UserPlus className="size-4" />;
}

function getNotificationTargetHref(notification: NotificationView) {
  if (notification.postId) {
    return `/post/${notification.postId}`;
  }

  return `/u/${notification.actor.username}`;
}

type NotificationListProps = {
  notifications: NotificationView[];
};

type FilterMode = "all" | "unread";

export function NotificationList({ notifications }: NotificationListProps) {
  const [filter, setFilter] = useState<FilterMode>("all");
  const unreadCount = notifications.filter((notification) => !notification.readAt).length;

  const filteredNotifications = useMemo(() => {
    if (filter === "all") {
      return notifications;
    }

    return notifications.filter((notification) => !notification.readAt);
  }, [filter, notifications]);

  const grouped = useMemo(() => {
    const groups = new Map<string, NotificationView[]>();

    for (const notification of filteredNotifications) {
      const key = getGroupLabel(notification.createdAt);
      const existing = groups.get(key) ?? [];
      existing.push(notification);
      groups.set(key, existing);
    }

    return Array.from(groups.entries());
  }, [filteredNotifications]);

  return (
    <section>
      <header className="border-b px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold">Recentes</h2>
            <Badge variant={unreadCount > 0 ? "default" : "secondary"} className="rounded-full tabular-nums">
              {unreadCount}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={filter === "unread" ? "default" : "outline"}
              className="rounded-full"
              onClick={() => setFilter("unread")}
            >
              Nao lidas
            </Button>
            <Button
              type="button"
              size="sm"
              variant={filter === "all" ? "default" : "outline"}
              className="rounded-full"
              onClick={() => setFilter("all")}
            >
              Todas
            </Button>
            <form action={markAllNotificationsReadAction}>
              <Button size="sm" variant="ghost" className="rounded-full" disabled={unreadCount === 0}>
                Marcar tudo como lido
              </Button>
            </form>
          </div>
        </div>
      </header>

      {filteredNotifications.length === 0 ? (
        <div className="px-4 py-16 text-center sm:px-6">
          <p className="text-sm font-medium">
            {filter === "unread" ? "Sem notificacoes nao lidas." : "Sem notificacoes no momento."}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Quando houver novas interacoes, elas aparecerao aqui.</p>
        </div>
      ) : (
        <div>
          {grouped.map(([label, items]) => (
            <section key={label} className="border-b last:border-b-0">
              <div className="sticky top-14 z-10 border-b bg-background/95 px-4 py-2 backdrop-blur sm:px-6">
                <p className="text-xs font-medium text-muted-foreground">{label}</p>
              </div>

              <div>
                {items.map((notification) => (
                  <article key={notification.id} className="border-b px-4 py-4 last:border-b-0 sm:px-6">
                    <div className="flex items-start gap-3">
                      <Avatar className="size-10 border">
                        <AvatarImage alt={notification.actor.name} src={notification.actor.avatar ?? undefined} />
                        <AvatarFallback>{initials(notification.actor.name)}</AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm">
                              <Link href={`/u/${notification.actor.username}`} className="font-semibold hover:underline">
                                {notification.actor.name}
                              </Link>{" "}
                              <span className="text-muted-foreground">{getNotificationActionLabel(notification)}</span>
                            </p>
                            <div className="mt-1 flex items-center gap-2">
                              <span className="text-muted-foreground">{getNotificationIcon(notification)}</span>
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(notification.createdAt, {
                                  addSuffix: true,
                                  locale: ptBR,
                                })}
                              </p>
                              {!notification.readAt ? (
                                <span
                                  aria-label="Nao lida"
                                  className="inline-block size-2 rounded-full bg-foreground"
                                />
                              ) : null}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button asChild variant="outline" size="sm" className="rounded-full">
                              <Link href={getNotificationTargetHref(notification)}>Abrir</Link>
                            </Button>
                            {!notification.readAt ? (
                              <form action={markNotificationReadAction}>
                                <input type="hidden" name="notificationId" value={notification.id} />
                                <Button size="sm" variant="ghost" className="rounded-full">
                                  Marcar lida
                                </Button>
                              </form>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
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

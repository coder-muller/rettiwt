import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

import { markAllNotificationsReadAction, markNotificationReadAction } from "@/lib/actions/notifications";
import type { NotificationView } from "@/lib/types/domain";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

function initials(name: string) {
  const parts = name.trim().split(" ").filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("");
}

function renderNotificationText(notification: NotificationView) {
  if (notification.type === "POST_LIKED") {
    return "curtiu seu post";
  }

  if (notification.type === "POST_COMMENTED") {
    return "comentou no seu post";
  }

  return "comecou a seguir voce";
}

type NotificationListProps = {
  notifications: NotificationView[];
};

export function NotificationList({ notifications }: NotificationListProps) {
  return (
    <section>
      <header className="flex items-center justify-between border-b px-4 py-3 sm:px-6">
        <h2 className="text-sm font-semibold">Recentes</h2>
        <form action={markAllNotificationsReadAction}>
          <Button size="sm" variant="outline" className="rounded-full">
            Marcar tudo como lido
          </Button>
        </form>
      </header>

      {notifications.length === 0 ? (
        <div className="px-4 py-16 text-center sm:px-6">
          <p className="text-sm text-muted-foreground">Sem notificacoes no momento.</p>
        </div>
      ) : (
        <div>
          {notifications.map((notification) => (
            <article
              key={notification.id}
              className="flex items-start justify-between gap-3 border-b px-4 py-4 sm:px-6"
            >
              <div className="flex min-w-0 items-start gap-3">
                <Avatar className="size-9 border">
                  <AvatarImage alt={notification.actor.name} src={notification.actor.avatar ?? undefined} />
                  <AvatarFallback>{initials(notification.actor.name)}</AvatarFallback>
                </Avatar>

                <div className="min-w-0 space-y-1">
                  <p className="text-sm">
                    <Link href={`/u/${notification.actor.username}`} className="font-semibold hover:underline">
                      {notification.actor.name}
                    </Link>{" "}
                    <span className="text-muted-foreground">{renderNotificationText(notification)}</span>
                    {notification.postId ? (
                      <>
                        {" "}
                        <Link href={`/post/${notification.postId}`} className="font-medium hover:underline">
                          Ver post
                        </Link>
                      </>
                    ) : null}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(notification.createdAt, {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </p>
                </div>
              </div>

              {notification.readAt ? null : (
                <form action={markNotificationReadAction}>
                  <input type="hidden" name="notificationId" value={notification.id} />
                  <Button size="sm" variant="ghost" className="rounded-full">
                    Marcar lida
                  </Button>
                </form>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

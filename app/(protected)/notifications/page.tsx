import { NotificationList } from "@/components/notifications/notification-list";
import { requireSession } from "@/lib/auth/session";
import { notificationService } from "@/lib/services/notification-service";

export default async function NotificationsPage() {
  const session = await requireSession();

  const notifications = await notificationService.listNotifications(session.user.id);

  return (
    <section>
      <header className="sticky top-0 z-10 border-b bg-background/90 px-4 py-3 backdrop-blur sm:px-6">
        <h1 className="text-lg font-semibold">Notificacoes</h1>
        <p className="text-xs text-muted-foreground">Acompanhe curtidas, comentarios, respostas e novos seguidores.</p>
      </header>

      <NotificationList notifications={notifications} />
    </section>
  );
}

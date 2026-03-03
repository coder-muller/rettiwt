import { NotificationList } from "@/components/notifications/notification-list";
import { requireSession } from "@/lib/auth/session";
import { notificationService } from "@/lib/services/notification-service";

export default async function NotificationsPage() {
  const session = await requireSession();

  const notifications = await notificationService.listNotifications(
    session.user.id,
  );

  return (
    <section>
      <header className="sticky top-0 z-10 border-b bg-background/95 px-4 py-3 backdrop-blur">
        <h1 className="text-[17px] font-extrabold">Notificacoes</h1>
      </header>

      <NotificationList notifications={notifications} />
    </section>
  );
}

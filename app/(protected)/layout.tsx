import { ProtectedShell } from "@/components/layout/protected-shell";
import { requireSession } from "@/lib/auth/session";
import { messageService } from "@/lib/services/message-service";
import { notificationService } from "@/lib/services/notification-service";
import { profileService } from "@/lib/services/profile-service";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const profile = await profileService.ensureProfileForUser({
    id: session.user.id,
    name: session.user.name,
    image: session.user.image,
  });
  const [unreadNotifications, unreadMessages] = await Promise.all([
    notificationService.countUnread(session.user.id),
    messageService.countUnreadMessages(session.user.id),
  ]);

  const username = profile.user.username;

  return (
    <ProtectedShell
      username={username}
      userName={profile.user.name}
      userAvatar={profile.avatarUrl ?? profile.user.image ?? null}
      unreadNotifications={unreadNotifications}
      unreadMessages={unreadMessages}
    >
      {children}
    </ProtectedShell>
  );
}

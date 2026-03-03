"use server";

import { revalidatePath } from "next/cache";

import { requireSession } from "@/lib/auth/session";
import { notificationService } from "@/lib/services/notification-service";
import { notificationIdSchema } from "@/lib/validation/notification";

export async function markNotificationReadAction(formData: FormData) {
  const session = await requireSession();

  const parsed = notificationIdSchema.safeParse({
    notificationId: formData.get("notificationId"),
  });

  if (!parsed.success) {
    return;
  }

  const ok = await notificationService.markRead(session.user.id, parsed.data.notificationId);

  if (!ok) {
    return;
  }

  revalidatePath("/notifications");
}

export async function markAllNotificationsReadAction() {
  const session = await requireSession();

  await notificationService.markAllRead(session.user.id);

  revalidatePath("/notifications");
}

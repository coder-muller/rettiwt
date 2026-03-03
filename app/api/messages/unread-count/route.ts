import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth/server";
import { messageService } from "@/lib/services/message-service";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const count = await messageService.countUnreadMessages(session.user.id);

  return NextResponse.json({ unreadCount: count });
}

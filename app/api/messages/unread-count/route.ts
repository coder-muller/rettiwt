import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth/session";
import { messageService } from "@/lib/services/message-service";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const count = await messageService.countUnreadMessages(session.user.id);

  return NextResponse.json({ unreadCount: count });
}

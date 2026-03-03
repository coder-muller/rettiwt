import { NextResponse } from "next/server";

import { getVerifiedSession } from "@/lib/auth/session";
import { messageService } from "@/lib/services/message-service";

export async function GET() {
  const session = await getVerifiedSession();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const conversations = await messageService.listConversationsForUser(session.user.id);

  return NextResponse.json({ conversations });
}

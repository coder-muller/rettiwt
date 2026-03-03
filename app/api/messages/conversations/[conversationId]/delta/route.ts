import { NextResponse } from "next/server";
import { z } from "zod";

import { getVerifiedSession } from "@/lib/auth/session";
import { messageService } from "@/lib/services/message-service";

const querySchema = z.object({
  after: z
    .string()
    .optional()
    .transform((value) => {
      if (!value) {
        return undefined;
      }

      const parsed = new Date(value);

      if (Number.isNaN(parsed.getTime())) {
        return null;
      }

      return parsed;
    }),
});

type RouteContext = {
  params: Promise<{ conversationId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const session = await getVerifiedSession();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { conversationId } = await context.params;
  const { searchParams } = new URL(request.url);

  const parsed = querySchema.safeParse({
    after: searchParams.get("after") ?? undefined,
  });

  if (!parsed.success || parsed.data.after === null) {
    return NextResponse.json({ message: "Invalid query." }, { status: 400 });
  }

  const messages = await messageService.listConversationMessagesAfter(
    session.user.id,
    conversationId,
    parsed.data.after,
  );

  if (!messages) {
    return NextResponse.json({ message: "Conversation not found." }, { status: 404 });
  }

  return NextResponse.json({
    messages,
    serverTime: new Date().toISOString(),
    hasMore: false,
  });
}

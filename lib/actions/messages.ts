"use server";

import { revalidatePath } from "next/cache";

import type { ActionState } from "@/lib/actions/action-state";
import { requireSession } from "@/lib/auth/session";
import { messageService } from "@/lib/services/message-service";

type ConversationActionState = ActionState & {
  conversationId?: string;
};

type SendMessageActionState = ActionState & {
  sentMessage?: {
    id: string;
    content: string;
    createdAt: string;
    sender: {
      id: string;
      username: string;
      name: string;
      avatar: string | null;
    };
    isMine: boolean;
  };
};

export async function startOrOpenConversationAction(input: { targetUserId: string }): Promise<ConversationActionState> {
  const session = await requireSession();

  const result = await messageService.startOrOpenDirectConversation(session.user.id, input);

  if (!result.success) {
    return {
      status: "error",
      message: result.message,
      fieldErrors: result.fieldErrors,
    };
  }

  revalidatePath("/messages");

  return {
    status: "success",
    conversationId: result.conversationId,
  };
}

export async function sendMessageAction(input: {
  conversationId: string;
  content: string;
}): Promise<SendMessageActionState> {
  const session = await requireSession();

  const result = await messageService.sendMessage(session.user.id, input);

  if (!result.success) {
    return {
      status: "error",
      message: result.message,
      fieldErrors: result.fieldErrors,
    };
  }

  revalidatePath("/messages");
  revalidatePath(`/messages/${result.conversationId}`);

  return {
    status: "success",
    sentMessage: result.message
      ? {
          ...result.message,
          createdAt: result.message.createdAt.toISOString(),
        }
      : undefined,
  };
}

export async function markConversationReadAction(input: { conversationId: string }) {
  const session = await requireSession();
  await messageService.markConversationRead(session.user.id, input.conversationId);

  revalidatePath("/messages");
  revalidatePath(`/messages/${input.conversationId}`);
}

"use server";

import { revalidatePath } from "next/cache";

import type { ActionState } from "@/lib/actions/action-state";
import { requireSession } from "@/lib/auth/session";
import { messageService } from "@/lib/services/message-service";

type ConversationActionState = ActionState & {
  conversationId?: string;
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
}): Promise<ActionState> {
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
  };
}

export async function markConversationReadAction(input: { conversationId: string }) {
  const session = await requireSession();
  await messageService.markConversationRead(session.user.id, input.conversationId);

  revalidatePath("/messages");
  revalidatePath(`/messages/${input.conversationId}`);
}

import { getIO } from "@/lib/realtime/socket-store";

type ConversationMessagePayload = {
  conversationId: string;
  message: {
    id: string;
    content: string;
    createdAt: string;
    sender: {
      id: string;
      username: string;
      name: string;
      avatar: string | null;
    };
  };
};

export function publishConversationMessage(payload: ConversationMessagePayload) {
  const io = getIO();

  if (!io) {
    return;
  }

  io.to(`conversation:${payload.conversationId}`).emit("message:new", payload);
}

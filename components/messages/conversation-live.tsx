"use client";

import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";

import { markConversationReadAction } from "@/lib/actions/messages";
import type { MessageView } from "@/lib/types/domain";
import { MessageComposer } from "@/components/messages/message-composer";
import { MessageThread } from "@/components/messages/message-thread";

type ConversationLiveProps = {
  conversationId: string;
  currentUserId: string;
  initialMessages: MessageView[];
};

type SocketMessagePayload = {
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

function normalizeIncomingMessage(
  payload: SocketMessagePayload["message"],
  currentUserId: string,
): MessageView {
  return {
    id: payload.id,
    content: payload.content,
    createdAt: new Date(payload.createdAt),
    sender: payload.sender,
    isMine: payload.sender.id === currentUserId,
  };
}

export function ConversationLive({ conversationId, currentUserId, initialMessages }: ConversationLiveProps) {
  const [messages, setMessages] = useState<MessageView[]>(initialMessages);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    const socketBaseUrl =
      process.env.NEXT_PUBLIC_RETTIWT_SOCKET_URL ||
      `${window.location.protocol}//${window.location.hostname}:${process.env.NEXT_PUBLIC_RETTIWT_SOCKET_PORT ?? "3002"}`;

    const socket = io(socketBaseUrl, {
      path: "/socket.io",
    });

    const joinRoom = () => {
      socket.emit("conversation:join", {
        conversationId,
      });
    };

    socket.on("connect", () => {
      if (!isCancelled) {
        setConnected(true);
      }
      joinRoom();
    });

    socket.on("disconnect", () => {
      if (!isCancelled) {
        setConnected(false);
      }
    });

    socket.on("message:new", (payload: SocketMessagePayload) => {
      if (payload.conversationId !== conversationId) {
        return;
      }

      const nextMessage = normalizeIncomingMessage(payload.message, currentUserId);

      setMessages((current) => {
        if (current.some((message) => message.id === nextMessage.id)) {
          return current;
        }

        return [...current, nextMessage];
      });

      if (!nextMessage.isMine) {
        void markConversationReadAction({
          conversationId,
        });
      }
    });

    joinRoom();

    return () => {
      isCancelled = true;
      socket.emit("conversation:leave", {
        conversationId,
      });
      socket.disconnect();
    };
  }, [conversationId, currentUserId]);

  const composerHint = useMemo(
    () => (connected ? "Conectado em tempo real." : "Reconectando mensagens em tempo real..."),
    [connected],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-hidden">
        <MessageThread messages={messages} />
      </div>

      <p className="border-t px-4 py-2 text-xs text-muted-foreground sm:px-6">{composerHint}</p>

      <MessageComposer
        conversationId={conversationId}
        onMessageSent={(message) => {
          const nextMessage = normalizeIncomingMessage(message, currentUserId);

          setMessages((current) => {
            if (current.some((item) => item.id === nextMessage.id)) {
              return current;
            }

            return [...current, nextMessage];
          });
        }}
      />
    </div>
  );
}

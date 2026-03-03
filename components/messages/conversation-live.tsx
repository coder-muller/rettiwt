"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { markConversationReadAction } from "@/lib/actions/messages";
import type { MessageView } from "@/lib/types/domain";
import { MessageComposer } from "@/components/messages/message-composer";
import { MessageThread } from "@/components/messages/message-thread";

type ConversationLiveProps = {
  conversationId: string;
  initialMessages: MessageView[];
};

type MessageDto = {
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

function mapIncomingMessage(payload: MessageDto): MessageView {
  return {
    id: payload.id,
    content: payload.content,
    createdAt: new Date(payload.createdAt),
    sender: payload.sender,
    isMine: payload.isMine,
  };
}

function mergeMessages(current: MessageView[], incoming: MessageView[]) {
  if (!incoming.length) {
    return current;
  }

  const knownIds = new Set(current.map((message) => message.id));
  const next = [...current];

  for (const message of incoming) {
    if (knownIds.has(message.id)) {
      continue;
    }

    knownIds.add(message.id);
    next.push(message);
  }

  next.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  return next;
}

function normalPollInterval() {
  if (typeof document === "undefined") {
    return 2000;
  }

  return document.hidden ? 8000 : 2000;
}

function failurePollInterval(failureCount: number) {
  return Math.min(15000, 2000 * 2 ** Math.max(0, failureCount - 1));
}

export function ConversationLive({ conversationId, initialMessages }: ConversationLiveProps) {
  const [messages, setMessages] = useState<MessageView[]>(initialMessages);
  const [isReconnecting, setIsReconnecting] = useState(false);

  const messagesRef = useRef<MessageView[]>(initialMessages);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlightRef = useRef(false);
  const cancelledRef = useRef(false);
  const failuresRef = useRef(0);
  const runPollNowRef = useRef<(() => Promise<void>) | null>(null);
  const markReadDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMessages(initialMessages);
    messagesRef.current = initialMessages;
  }, [initialMessages]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    cancelledRef.current = false;

    const scheduleMarkRead = () => {
      if (markReadDebounceRef.current) {
        clearTimeout(markReadDebounceRef.current);
      }

      markReadDebounceRef.current = setTimeout(() => {
        void markConversationReadAction({ conversationId });
      }, 600);
    };

    const scheduleNext = (delay: number, fn: () => Promise<void>) => {
      if (cancelledRef.current) {
        return;
      }

      timerRef.current = setTimeout(() => {
        void fn();
      }, delay);
    };

    const syncMessages = async () => {
      if (cancelledRef.current || inFlightRef.current) {
        return;
      }

      inFlightRef.current = true;

      try {
        const last = messagesRef.current[messagesRef.current.length - 1];
        const params = new URLSearchParams();

        if (last?.createdAt) {
          params.set("after", last.createdAt.toISOString());
        }

        const query = params.toString();
        const url = query
          ? `/api/messages/conversations/${conversationId}/delta?${query}`
          : `/api/messages/conversations/${conversationId}/delta`;

        const response = await fetch(url, {
          method: "GET",
          cache: "no-store",
          headers: {
            "Cache-Control": "no-store",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to poll messages.");
        }

        const payload = (await response.json()) as { messages?: MessageDto[] };
        const incomingDtos = Array.isArray(payload.messages) ? payload.messages : [];
        const incoming = incomingDtos.map(mapIncomingMessage);

        if (incoming.length > 0) {
          setMessages((current) => mergeMessages(current, incoming));

          if (incoming.some((message) => !message.isMine)) {
            scheduleMarkRead();
          }
        }

        failuresRef.current = 0;
        setIsReconnecting(false);
        scheduleNext(normalPollInterval(), syncMessages);
      } catch {
        failuresRef.current += 1;
        setIsReconnecting(true);
        scheduleNext(failurePollInterval(failuresRef.current), syncMessages);
      } finally {
        inFlightRef.current = false;
      }
    };

    runPollNowRef.current = syncMessages;
    void syncMessages();

    const onVisibilityChange = () => {
      if (document.hidden) {
        return;
      }

      void syncMessages();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelledRef.current = true;
      runPollNowRef.current = null;

      document.removeEventListener("visibilitychange", onVisibilityChange);

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      if (markReadDebounceRef.current) {
        clearTimeout(markReadDebounceRef.current);
      }
    };
  }, [conversationId]);

  const composerHint = useMemo(
    () => (isReconnecting ? "Reconectando mensagens..." : "Atualizando mensagens automaticamente."),
    [isReconnecting],
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
          const nextMessage = mapIncomingMessage({
            ...message,
            createdAt: message.createdAt,
          });

          setMessages((current) => mergeMessages(current, [nextMessage]));
          void runPollNowRef.current?.();
        }}
      />
    </div>
  );
}

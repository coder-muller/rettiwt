"use client";

import { useEffect, useMemo, useState } from "react";

import type { ConversationListItem } from "@/lib/types/domain";
import { ConversationList } from "@/components/messages/conversation-list";

type ConversationListDto = {
  conversationId: string;
  peer: {
    id: string;
    username: string;
    name: string;
    avatar: string | null;
  };
  lastMessage: {
    content: string;
    createdAt: string;
    senderId: string;
  } | null;
  unreadCount: number;
  lastMessageAt: string;
};

type LiveConversationListProps = {
  initialConversations: ConversationListItem[];
  activeConversationId?: string;
};

function mapConversationDto(dto: ConversationListDto): ConversationListItem {
  return {
    conversationId: dto.conversationId,
    peer: dto.peer,
    unreadCount: dto.unreadCount,
    lastMessageAt: new Date(dto.lastMessageAt),
    lastMessage: dto.lastMessage
      ? {
          ...dto.lastMessage,
          createdAt: new Date(dto.lastMessage.createdAt),
        }
      : null,
  };
}

function getConversationPollInterval() {
  if (typeof document === "undefined") {
    return 10000;
  }

  return document.hidden ? 30000 : 10000;
}

export function LiveConversationList({ initialConversations, activeConversationId }: LiveConversationListProps) {
  const [conversations, setConversations] = useState<ConversationListItem[]>(initialConversations);
  const [syncKey, setSyncKey] = useState(0);

  useEffect(() => {
    setConversations(initialConversations);
  }, [initialConversations]);

  useEffect(() => {
    const onVisibility = () => setSyncKey((value) => value + 1);

    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const sync = async () => {
      try {
        const response = await fetch("/api/messages/conversations", {
          method: "GET",
          cache: "no-store",
          headers: {
            "Cache-Control": "no-store",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to sync conversations.");
        }

        const payload = (await response.json()) as { conversations?: ConversationListDto[] };

        if (!cancelled && Array.isArray(payload.conversations)) {
          setConversations(payload.conversations.map(mapConversationDto));
        }
      } catch {
        // Silent failure; next interval retries automatically.
      } finally {
        if (!cancelled) {
          timer = setTimeout(() => {
            void sync();
          }, getConversationPollInterval());
        }
      }
    };

    void sync();

    return () => {
      cancelled = true;
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [syncKey]);

  const sortedConversations = useMemo(
    () => [...conversations].sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime()),
    [conversations],
  );

  return <ConversationList conversations={sortedConversations} activeConversationId={activeConversationId} />;
}

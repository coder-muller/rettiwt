import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

import type { ConversationListItem } from "@/lib/types/domain";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

function initials(name: string) {
  const parts = name.trim().split(" ").filter(Boolean);
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

type ConversationListProps = {
  conversations: ConversationListItem[];
  activeConversationId?: string;
};

export function ConversationList({
  conversations,
  activeConversationId,
}: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-[20px] font-extrabold">Sem mensagens</p>
        <p className="mt-1 text-[15px] text-muted-foreground">
          Voce ainda nao possui conversas.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto">
      {conversations.map((conversation) => (
        <Link
          key={conversation.conversationId}
          href={`/messages/${conversation.conversationId}`}
          className={cn(
            "relative flex items-center gap-3 border-b px-4 py-3 transition-colors hover:bg-accent/30",
            conversation.conversationId === activeConversationId &&
              "bg-accent/20",
          )}
        >
          {conversation.conversationId === activeConversationId ? (
            <span className="absolute inset-y-0 left-0 w-0.5 bg-foreground" />
          ) : null}

          <Avatar className="size-12">
            <AvatarImage
              alt={conversation.peer.name}
              src={conversation.peer.avatar ?? undefined}
            />
            <AvatarFallback>{initials(conversation.peer.name)}</AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-[15px] font-bold">
                {conversation.peer.name}
              </p>
              <p className="shrink-0 text-[13px] text-muted-foreground">
                {formatDistanceToNow(conversation.lastMessageAt, {
                  addSuffix: false,
                  locale: ptBR,
                })}
              </p>
            </div>
            <p className="truncate text-[13px] text-muted-foreground">
              {conversation.lastMessage?.senderId
                ? `${conversation.lastMessage.senderId === conversation.peer.id ? "" : "Voce: "}${conversation.lastMessage.content}`
                : "Nenhuma mensagem ainda"}
            </p>
          </div>

          {conversation.unreadCount > 0 ? (
            <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
              {conversation.unreadCount > 9
                ? "9+"
                : conversation.unreadCount}
            </span>
          ) : null}
        </Link>
      ))}
    </div>
  );
}

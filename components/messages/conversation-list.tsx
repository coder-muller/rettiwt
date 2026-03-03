import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

import type { ConversationListItem } from "@/lib/types/domain";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function initials(name: string) {
  const parts = name.trim().split(" ").filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("");
}

type ConversationListProps = {
  conversations: ConversationListItem[];
  activeConversationId?: string;
};

export function ConversationList({ conversations, activeConversationId }: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="px-4 py-10 text-sm text-muted-foreground">Voce ainda nao possui conversas.</div>
    );
  }

  return (
    <div className="overflow-y-auto">
      {conversations.map((conversation) => (
        <Link
          key={conversation.conversationId}
          href={`/messages/${conversation.conversationId}`}
          className={cn(
            "relative flex items-center gap-3 border-b px-4 py-3 transition-colors hover:bg-muted/40",
            conversation.conversationId === activeConversationId && "bg-muted/60",
          )}
        >
          {conversation.conversationId === activeConversationId ? (
            <span className="absolute inset-y-0 left-0 w-1 bg-foreground" />
          ) : null}

          <Avatar className="size-10 border">
            <AvatarImage alt={conversation.peer.name} src={conversation.peer.avatar ?? undefined} />
            <AvatarFallback>{initials(conversation.peer.name)}</AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-semibold">{conversation.peer.name}</p>
              <p className="shrink-0 text-xs text-muted-foreground">
                {formatDistanceToNow(conversation.lastMessageAt, {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </p>
            </div>
            <p className="truncate text-xs text-muted-foreground">
              {conversation.lastMessage?.senderId
                ? `${conversation.lastMessage.senderId === conversation.peer.id ? "" : "Voce: "}${conversation.lastMessage.content}`
                : "Nenhuma mensagem ainda"}
            </p>
          </div>

          {conversation.unreadCount > 0 ? (
            <Badge className="rounded-full">{conversation.unreadCount}</Badge>
          ) : null}
        </Link>
      ))}
    </div>
  );
}

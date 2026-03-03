import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

import type { MessageView } from "@/lib/types/domain";
import { cn } from "@/lib/utils";

type MessageThreadProps = {
  messages: MessageView[];
};

export function MessageThread({ messages }: MessageThreadProps) {
  if (messages.length === 0) {
    return (
      <div className="px-4 py-10 text-center text-sm text-muted-foreground">Envie a primeira mensagem.</div>
    );
  }

  return (
    <div className="space-y-3 px-4 py-5 sm:px-6">
      {messages.map((message) => (
        <article key={message.id} className={cn("flex", message.isMine ? "justify-end" : "justify-start")}>
          <div
            className={cn(
              "max-w-[78%] rounded-2xl border px-3 py-2",
              message.isMine ? "bg-primary text-primary-foreground" : "bg-card shadow-xs",
            )}
          >
            <p className="whitespace-pre-line break-words text-sm leading-6">{message.content}</p>
            <p
              className={cn(
                "mt-1 text-[11px]",
                message.isMine ? "text-primary-foreground/80" : "text-muted-foreground",
              )}
            >
              {formatDistanceToNow(message.createdAt, {
                addSuffix: true,
                locale: ptBR,
              })}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}

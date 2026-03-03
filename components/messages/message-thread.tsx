"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  differenceInCalendarDays,
  format,
  formatDistanceToNow,
  isToday,
  isYesterday,
} from "date-fns";
import { ptBR } from "date-fns/locale";

import type { MessageView } from "@/lib/types/domain";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type MessageThreadProps = {
  messages: MessageView[];
};

type TimelineItem =
  | {
      kind: "separator";
      id: string;
      label: string;
    }
  | {
      kind: "message";
      id: string;
      message: MessageView;
    };

function toGroupLabel(messageDate: Date, now: Date) {
  if (isToday(messageDate)) {
    return "Hoje";
  }

  if (isYesterday(messageDate)) {
    return "Ontem";
  }

  const dayDiff = differenceInCalendarDays(now, messageDate);

  if (dayDiff <= 7) {
    return "Semana passada";
  }

  if (dayDiff <= 31) {
    return "Mes passado";
  }

  return format(messageDate, "d 'de' MMMM yyyy", { locale: ptBR });
}

function isNearBottom(element: HTMLElement) {
  return element.scrollHeight - element.scrollTop - element.clientHeight < 120;
}

export function MessageThread({ messages }: MessageThreadProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const shouldStickRef = useRef(true);
  const isFirstPaintRef = useRef(true);
  const [showJumpToLatest, setShowJumpToLatest] = useState(false);

  const timeline = useMemo<TimelineItem[]>(() => {
    const items: TimelineItem[] = [];
    const now = new Date();
    let previousLabel: string | null = null;

    for (const message of messages) {
      const label = toGroupLabel(message.createdAt, now);

      if (label !== previousLabel) {
        items.push({
          kind: "separator",
          id: `separator-${label}-${message.id}`,
          label,
        });
        previousLabel = label;
      }

      items.push({
        kind: "message",
        id: message.id,
        message,
      });
    }

    return items;
  }, [messages]);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    if (isFirstPaintRef.current) {
      container.scrollTop = container.scrollHeight;
      shouldStickRef.current = true;
      isFirstPaintRef.current = false;
      return;
    }

    const lastMessage = messages[messages.length - 1];
    const shouldAutoScroll = shouldStickRef.current || Boolean(lastMessage?.isMine);

    if (shouldAutoScroll) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  function handleScroll() {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const isBottom = isNearBottom(container);
    shouldStickRef.current = isBottom;

    if (isBottom) {
      setShowJumpToLatest(false);
      return;
    }

    setShowJumpToLatest(true);
  }

  if (messages.length === 0) {
    return (
      <div className="px-4 py-10 text-center text-sm text-muted-foreground">Envie a primeira mensagem.</div>
    );
  }

  return (
    <div className="relative h-full">
      <div ref={containerRef} onScroll={handleScroll} className="h-full overflow-y-auto px-4 py-5 sm:px-6">
        <div className="space-y-3">
          {timeline.map((item) => {
            if (item.kind === "separator") {
              return (
                <div key={item.id} className="py-2">
                  <p className="text-center text-xs font-medium text-muted-foreground">{item.label}</p>
                </div>
              );
            }

            const message = item.message;

            return (
              <article key={item.id} className={cn("flex", message.isMine ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[78%] rounded-2xl border px-3 py-2",
                    message.isMine ? "bg-primary text-primary-foreground" : "bg-card shadow-xs",
                  )}
                >
                  <p className="whitespace-pre-wrap break-words text-sm leading-6">{message.content}</p>
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
            );
          })}
        </div>
      </div>

      {showJumpToLatest ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center px-4">
          <Button
            type="button"
            size="sm"
            className="pointer-events-auto rounded-full shadow-sm"
            onClick={() => {
              const container = containerRef.current;
              if (!container) {
                return;
              }

              container.scrollTo({
                top: container.scrollHeight,
                behavior: "smooth",
              });
              shouldStickRef.current = true;
              setShowJumpToLatest(false);
            }}
          >
            Novas mensagens
          </Button>
        </div>
      ) : null}
    </div>
  );
}

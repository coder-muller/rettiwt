import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { ConversationList } from "@/components/messages/conversation-list";
import { ConversationLive } from "@/components/messages/conversation-live";
import { requireSession } from "@/lib/auth/session";
import { messageService } from "@/lib/services/message-service";

type ConversationPageProps = {
  params: Promise<{ conversationId: string }>;
};

export default async function ConversationPage({ params }: ConversationPageProps) {
  const { conversationId } = await params;
  const session = await requireSession();

  const [conversations, thread] = await Promise.all([
    messageService.listConversationsForUser(session.user.id),
    messageService.getConversationThread(session.user.id, conversationId),
  ]);

  if (!thread) {
    notFound();
  }

  await messageService.markConversationRead(session.user.id, conversationId);

  return (
    <section className="grid min-h-dvh grid-cols-1 overflow-hidden lg:grid-cols-[360px_minmax(0,1fr)]">
      <div className="hidden min-h-0 border-r lg:block">
        <header className="sticky top-0 z-10 border-b bg-background px-4 py-3 sm:px-6">
          <h1 className="text-lg font-semibold">Mensagens</h1>
        </header>
        <div className="h-[calc(100dvh-4.25rem)] overflow-y-auto">
          <ConversationList conversations={conversations} activeConversationId={conversationId} />
        </div>
      </div>

      <div className="flex min-h-dvh min-w-0 flex-col">
        <header className="sticky top-0 z-10 border-b bg-background px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/messages" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground lg:hidden">
              <ChevronLeft className="size-4" />
              Voltar
            </Link>
            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold">{thread.peer.name}</h2>
              <p className="truncate text-xs text-muted-foreground">@{thread.peer.username}</p>
            </div>
          </div>
        </header>

        <div className="min-h-0 flex-1 bg-muted/20">
          <ConversationLive
            key={conversationId}
            conversationId={conversationId}
            currentUserId={session.user.id}
            initialMessages={thread.messages}
          />
        </div>
      </div>
    </section>
  );
}

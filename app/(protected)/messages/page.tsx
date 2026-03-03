import { ConversationList } from "@/components/messages/conversation-list";
import { requireSession } from "@/lib/auth/session";
import { messageService } from "@/lib/services/message-service";

export default async function MessagesPage() {
  const session = await requireSession();

  const conversations = await messageService.listConversationsForUser(session.user.id);

  return (
    <section className="grid min-h-dvh grid-cols-1 overflow-hidden lg:grid-cols-[360px_minmax(0,1fr)]">
      <div className="min-h-0 border-r">
        <header className="sticky top-0 z-10 border-b bg-background px-4 py-3 sm:px-6">
          <h1 className="text-lg font-semibold">Mensagens</h1>
        </header>
        <div className="h-[calc(100dvh-4.25rem)] overflow-y-auto">
          <ConversationList conversations={conversations} />
        </div>
      </div>

      <div className="hidden items-center justify-center p-10 lg:flex">
        <div className="max-w-md space-y-3 rounded-2xl border bg-card p-8 text-center">
          <h2 className="text-xl font-semibold text-balance">Selecione uma conversa</h2>
          <p className="text-sm text-muted-foreground text-pretty">
            Escolha um chat na coluna da esquerda para ler e responder mensagens.
          </p>
        </div>
      </div>
    </section>
  );
}

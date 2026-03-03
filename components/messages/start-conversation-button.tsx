"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { startOrOpenConversationAction } from "@/lib/actions/messages";
import { Button } from "@/components/ui/button";

type StartConversationButtonProps = {
  targetUserId: string;
};

export function StartConversationButton({ targetUserId }: StartConversationButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function onStart() {
    startTransition(async () => {
      const result = await startOrOpenConversationAction({
        targetUserId,
      });

      if (result.status === "success" && result.conversationId) {
        router.push(`/messages/${result.conversationId}`);
      }
    });
  }

  return (
    <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={onStart} disabled={isPending}>
      {isPending ? "Abrindo..." : "Mensagem"}
    </Button>
  );
}

import { conversationRepository } from "@/lib/repositories/conversation-repository";
import { followRepository } from "@/lib/repositories/follow-repository";
import { messageRepository } from "@/lib/repositories/message-repository";
import { userRepository } from "@/lib/repositories/user-repository";
import { consumeRateLimit } from "@/lib/services/rate-limit-service";
import type { ConversationListItem, MessageView } from "@/lib/types/domain";
import { conversationIdSchema, sendMessageSchema, startConversationSchema } from "@/lib/validation/message";

function directKeyFor(userA: string, userB: string) {
  return [userA, userB].sort().join(":");
}

function mapMessage(
  row: {
    id: string;
    content: string;
    createdAt: Date;
    senderId: string;
    sender: {
      id: string;
      name: string;
      username: string;
      image: string | null;
      profile: {
        avatarUrl: string | null;
      } | null;
    };
  },
  currentUserId: string,
): MessageView {
  return {
    id: row.id,
    content: row.content,
    createdAt: row.createdAt,
    sender: {
      id: row.sender.id,
      username: row.sender.username,
      name: row.sender.name,
      avatar: row.sender.profile?.avatarUrl ?? row.sender.image ?? null,
    },
    isMine: row.senderId === currentUserId,
  };
}

export const messageService = {
  async startOrOpenDirectConversation(currentUserId: string, input: unknown) {
    const startLimit = consumeRateLimit({
      key: `start-dm:${currentUserId}`,
      limit: 30,
      windowMs: 60 * 60 * 1000,
    });

    if (!startLimit.allowed) {
      return {
        success: false as const,
        message: "Muitas tentativas de iniciar conversa. Tente novamente mais tarde.",
      };
    }

    const parsed = startConversationSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false as const,
        fieldErrors: parsed.error.flatten().fieldErrors,
        message: "Dados invalidos.",
      };
    }

    const targetUserId = parsed.data.targetUserId;

    if (targetUserId === currentUserId) {
      return {
        success: false as const,
        message: "Voce nao pode iniciar conversa com voce mesmo.",
      };
    }

    const targetUser = await userRepository.findById(targetUserId);

    if (!targetUser) {
      return {
        success: false as const,
        message: "Usuario nao encontrado.",
      };
    }

    const canMessage = await followRepository.isMutualFollow(currentUserId, targetUserId);

    if (!canMessage) {
      return {
        success: false as const,
        message: "DM disponivel apenas entre seguidores mutuos.",
      };
    }

    const directKey = directKeyFor(currentUserId, targetUserId);
    const existing = await conversationRepository.findByDirectKey(directKey);

    if (existing) {
      return {
        success: true as const,
        conversationId: existing.id,
      };
    }

    const created = await conversationRepository.createDirectConversation({
      directKey,
      participantIds: [currentUserId, targetUserId],
    });

    return {
      success: true as const,
      conversationId: created.id,
    };
  },

  async listConversationsForUser(userId: string) {
    const rows = await conversationRepository.listByUserId(userId);

    const items = await Promise.all(
      rows.map(async (row) => {
        const peerParticipant = row.conversation.participants.find((participant) => participant.userId !== userId);

        if (!peerParticipant) {
          return null;
        }

        const unreadCount = await messageRepository.countUnreadForConversation({
          conversationId: row.conversationId,
          userId,
          lastReadAt: row.lastReadAt,
        });

        const last = row.conversation.messages[0] ?? null;

        const item: ConversationListItem = {
          conversationId: row.conversation.id,
          peer: {
            id: peerParticipant.user.id,
            username: peerParticipant.user.username,
            name: peerParticipant.user.name,
            avatar: peerParticipant.user.profile?.avatarUrl ?? peerParticipant.user.image ?? null,
          },
          lastMessage: last
            ? {
                content: last.content,
                createdAt: last.createdAt,
                senderId: last.senderId,
              }
            : null,
          unreadCount,
          lastMessageAt: row.conversation.lastMessageAt,
        };

        return item;
      }),
    );

    return items.filter((item): item is ConversationListItem => Boolean(item));
  },

  async getConversationThread(userId: string, conversationId: string) {
    const parsed = conversationIdSchema.safeParse({ conversationId });

    if (!parsed.success) {
      return null;
    }

    const conversation = await conversationRepository.findById(parsed.data.conversationId);

    if (!conversation) {
      return null;
    }

    const isParticipant = conversation.participants.some((participant) => participant.userId === userId);

    if (!isParticipant) {
      return null;
    }

    const peer = conversation.participants.find((participant) => participant.userId !== userId)?.user;

    if (!peer) {
      return null;
    }

    const messages = await messageRepository.listByConversationId(conversation.id);

    return {
      conversationId: conversation.id,
      peer: {
        id: peer.id,
        username: peer.username,
        name: peer.name,
        avatar: peer.profile?.avatarUrl ?? peer.image ?? null,
      },
      messages: messages.map((message) => mapMessage(message, userId)),
    };
  },

  async sendMessage(userId: string, input: unknown) {
    const messageLimit = consumeRateLimit({
      key: `dm-message:${userId}`,
      limit: 120,
      windowMs: 5 * 60 * 1000,
    });

    if (!messageLimit.allowed) {
      return {
        success: false as const,
        message: "Muitas mensagens em pouco tempo. Aguarde um pouco para continuar.",
      };
    }

    const parsed = sendMessageSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false as const,
        fieldErrors: parsed.error.flatten().fieldErrors,
        message: "Mensagem invalida.",
      };
    }

    const conversation = await conversationRepository.findById(parsed.data.conversationId);

    if (!conversation) {
      return {
        success: false as const,
        message: "Conversa nao encontrada.",
      };
    }

    const isParticipant = conversation.participants.some((participant) => participant.userId === userId);

    if (!isParticipant) {
      return {
        success: false as const,
        message: "Sem permissao para enviar mensagem nesta conversa.",
      };
    }

    await messageRepository.create({
      conversationId: parsed.data.conversationId,
      senderId: userId,
      content: parsed.data.content,
    });

    return {
      success: true as const,
      conversationId: parsed.data.conversationId,
    };
  },

  async markConversationRead(userId: string, conversationId: string) {
    const participant = await conversationRepository.getParticipantRecord(conversationId, userId);

    if (!participant) {
      return false;
    }

    await conversationRepository.markRead(conversationId, userId);
    return true;
  },

  async countUnreadMessages(userId: string) {
    const rows = await conversationRepository.listByUserId(userId);

    const counts = await Promise.all(
      rows.map((row) =>
        messageRepository.countUnreadForConversation({
          conversationId: row.conversationId,
          userId,
          lastReadAt: row.lastReadAt,
        }),
      ),
    );

    return counts.reduce((total, count) => total + count, 0);
  },
};

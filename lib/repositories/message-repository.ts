import { prisma } from "@/lib/db/prisma";

export const messageRepository = {
  listByConversationId(conversationId: string) {
    return prisma.message.findMany({
      where: {
        conversationId,
      },
      include: {
        sender: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      take: 500,
    });
  },

  create(input: { conversationId: string; senderId: string; content: string }) {
    return prisma.$transaction(async (tx) => {
      const message = await tx.message.create({
        data: {
          conversationId: input.conversationId,
          senderId: input.senderId,
          content: input.content,
        },
      });

      await tx.conversation.update({
        where: {
          id: input.conversationId,
        },
        data: {
          lastMessageAt: message.createdAt,
        },
      });

      return message;
    });
  },

  countUnreadForConversation(input: { conversationId: string; userId: string; lastReadAt: Date | null }) {
    return prisma.message.count({
      where: {
        conversationId: input.conversationId,
        senderId: {
          not: input.userId,
        },
        ...(input.lastReadAt
          ? {
              createdAt: {
                gt: input.lastReadAt,
              },
            }
          : {}),
      },
    });
  },
};

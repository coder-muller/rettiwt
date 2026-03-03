import { prisma } from "@/lib/db/prisma";

export const conversationRepository = {
  findByDirectKey(directKey: string) {
    return prisma.conversation.findUnique({
      where: {
        directKey,
      },
    });
  },

  createDirectConversation(input: { directKey: string; participantIds: [string, string] }) {
    return prisma.conversation.create({
      data: {
        kind: "DIRECT",
        directKey: input.directKey,
        participants: {
          create: [
            {
              userId: input.participantIds[0],
              lastReadAt: new Date(),
            },
            {
              userId: input.participantIds[1],
              lastReadAt: new Date(),
            },
          ],
        },
      },
    });
  },

  findById(conversationId: string) {
    return prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
      include: {
        participants: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
    });
  },

  listByUserId(userId: string) {
    return prisma.conversationParticipant.findMany({
      where: {
        userId,
      },
      include: {
        conversation: {
          include: {
            participants: {
              include: {
                user: {
                  include: {
                    profile: true,
                  },
                },
              },
            },
            messages: {
              orderBy: {
                createdAt: "desc",
              },
              take: 1,
              include: {
                sender: {
                  select: {
                    id: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        conversation: {
          lastMessageAt: "desc",
        },
      },
      take: 100,
    });
  },

  markRead(conversationId: string, userId: string) {
    return prisma.conversationParticipant.updateMany({
      where: {
        conversationId,
        userId,
      },
      data: {
        lastReadAt: new Date(),
      },
    });
  },

  getParticipantRecord(conversationId: string, userId: string) {
    return prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
    });
  },
};

import { prisma } from "@/lib/db/prisma";
import type { NotificationType } from "@/lib/generated/prisma/enums";

export const notificationRepository = {
  async create(input: {
    recipientId: string;
    actorId: string;
    type: NotificationType;
    postId?: string | null;
    commentId?: string | null;
    dedupeKey?: string | null;
  }) {
    if (input.dedupeKey) {
      return prisma.notification.upsert({
        where: {
          dedupeKey: input.dedupeKey,
        },
        create: {
          recipientId: input.recipientId,
          actorId: input.actorId,
          type: input.type,
          postId: input.postId,
          commentId: input.commentId,
          dedupeKey: input.dedupeKey,
        },
        update: {
          readAt: null,
          createdAt: new Date(),
          actorId: input.actorId,
          postId: input.postId,
          commentId: input.commentId,
        },
      });
    }

    return prisma.notification.create({
      data: {
        recipientId: input.recipientId,
        actorId: input.actorId,
        type: input.type,
        postId: input.postId,
        commentId: input.commentId,
      },
    });
  },

  deleteByDedupeKey(dedupeKey: string) {
    return prisma.notification.deleteMany({
      where: {
        dedupeKey,
      },
    });
  },

  listByRecipient(recipientId: string) {
    return prisma.notification.findMany({
      where: {
        recipientId,
      },
      include: {
        actor: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
    });
  },

  markRead(notificationId: string, recipientId: string) {
    return prisma.notification.updateMany({
      where: {
        id: notificationId,
        recipientId,
      },
      data: {
        readAt: new Date(),
      },
    });
  },

  markAllRead(recipientId: string) {
    return prisma.notification.updateMany({
      where: {
        recipientId,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });
  },

  countUnread(recipientId: string) {
    return prisma.notification.count({
      where: {
        recipientId,
        readAt: null,
      },
    });
  },
};

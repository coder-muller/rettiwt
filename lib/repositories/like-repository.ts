import { prisma } from "@/lib/db/prisma";

export const likeRepository = {
  async toggle(postId: string, userId: string) {
    const existing = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (existing) {
      await prisma.like.delete({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });
      return false;
    }

    await prisma.like.create({
      data: {
        userId,
        postId,
      },
    });

    return true;
  },

  countByPostId(postId: string) {
    return prisma.like.count({
      where: {
        postId,
      },
    });
  },
};

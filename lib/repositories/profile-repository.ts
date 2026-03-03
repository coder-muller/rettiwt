import { prisma } from "@/lib/db/prisma";

export const profileRepository = {
  findByUserId(userId: string) {
    return prisma.profile.findUnique({
      where: { userId },
      include: {
        user: true,
      },
    });
  },

  findByUsername(username: string) {
    return prisma.profile.findFirst({
      where: {
        user: {
          username,
        },
      },
      include: {
        user: true,
      },
    });
  },

  findUserByUsernameExcludingUser(username: string, userId: string) {
    return prisma.user.findFirst({
      where: {
        username,
        id: {
          not: userId,
        },
      },
      select: {
        id: true,
      },
    });
  },

  create(input: { userId: string; bio?: string; avatarUrl?: string | null }) {
    return prisma.profile.create({
      data: {
        userId: input.userId,
        bio: input.bio ?? "",
        avatarUrl: input.avatarUrl,
      },
      include: {
        user: true,
      },
    });
  },

  updateByUserId(
    userId: string,
    input: {
      username: string;
      bio: string;
      avatarUrl: string | null;
      name: string;
    },
  ) {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: userId },
        data: {
          name: input.name,
          image: input.avatarUrl,
          username: input.username,
          displayUsername: input.username,
        },
      });

      const profile = await tx.profile.update({
        where: { userId },
        data: {
          bio: input.bio,
          avatarUrl: input.avatarUrl,
        },
      });

      return { user, profile };
    });
  },

  countPostsByUserId(userId: string) {
    return prisma.post.count({
      where: {
        authorId: userId,
      },
    });
  },
};

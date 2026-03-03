import { prisma } from "@/lib/db/prisma";

export const userRepository = {
  findById(userId: string) {
    return prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        profile: true,
      },
    });
  },

  findByUsername(username: string) {
    return prisma.user.findUnique({
      where: {
        username,
      },
      include: {
        profile: true,
      },
    });
  },

  searchByUsernameOrName(query: string, limit = 10) {
    return prisma.user.findMany({
      where: {
        OR: [
          {
            username: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            name: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      },
      include: {
        profile: true,
      },
      take: Math.min(limit * 3, 50),
    });
  },
};

import { prisma } from "@/lib/db/prisma";

export const followRepository = {
  async follow(followerId: string, followingId: string) {
    return prisma.follow.upsert({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
      create: {
        followerId,
        followingId,
      },
      update: {},
    });
  },

  unfollow(followerId: string, followingId: string) {
    return prisma.follow.deleteMany({
      where: {
        followerId,
        followingId,
      },
    });
  },

  exists(followerId: string, followingId: string) {
    return prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
      select: {
        followerId: true,
      },
    });
  },

  countFollowers(userId: string) {
    return prisma.follow.count({
      where: {
        followingId: userId,
      },
    });
  },

  countFollowing(userId: string) {
    return prisma.follow.count({
      where: {
        followerId: userId,
      },
    });
  },

  async getRelationship(viewerId: string, targetUserId: string) {
    const [isFollowingByMe, followsMe] = await Promise.all([
      prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: viewerId,
            followingId: targetUserId,
          },
        },
        select: { followerId: true },
      }),
      prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: targetUserId,
            followingId: viewerId,
          },
        },
        select: { followerId: true },
      }),
    ]);

    return {
      isFollowingByMe: Boolean(isFollowingByMe),
      followsMe: Boolean(followsMe),
    };
  },

  listFollowers(userId: string) {
    return prisma.follow.findMany({
      where: {
        followingId: userId,
      },
      include: {
        follower: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 200,
    });
  },

  listFollowing(userId: string) {
    return prisma.follow.findMany({
      where: {
        followerId: userId,
      },
      include: {
        following: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 200,
    });
  },

  listFollowingIdsForFollower(followerId: string, targetIds: string[]) {
    if (targetIds.length === 0) {
      return Promise.resolve([] as string[]);
    }

    return prisma.follow
      .findMany({
        where: {
          followerId,
          followingId: {
            in: targetIds,
          },
        },
        select: {
          followingId: true,
        },
      })
      .then((rows) => rows.map((row) => row.followingId));
  },

  async isMutualFollow(userA: string, userB: string) {
    const [aFollowsB, bFollowsA] = await Promise.all([
      prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: userA,
            followingId: userB,
          },
        },
        select: { followerId: true },
      }),
      prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: userB,
            followingId: userA,
          },
        },
        select: { followerId: true },
      }),
    ]);

    return Boolean(aFollowsB && bFollowsA);
  },
};

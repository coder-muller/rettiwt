import { prisma } from "@/lib/db/prisma";

export const postRepository = {
  create(input: { authorId: string; content: string }) {
    return prisma.post.create({
      data: {
        authorId: input.authorId,
        content: input.content,
      },
    });
  },

  deleteByIdAndAuthor(postId: string, authorId: string) {
    return prisma.post.deleteMany({
      where: {
        id: postId,
        authorId,
      },
    });
  },

  listFeed(currentUserId: string) {
    return prisma.post.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        author: {
          include: {
            profile: true,
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
      },
      take: 100,
    }).then((rows) =>
      rows.map((row) => ({
        id: row.id,
        content: row.content,
        createdAt: row.createdAt,
        author: {
          id: row.authorId,
          name: row.author.name,
          username: row.author.username,
          avatar: row.author.profile?.avatarUrl ?? row.author.image ?? null,
        },
        likeCount: row.likes.length,
        likedByMe: row.likes.some((like) => like.userId === currentUserId),
        isOwner: row.authorId === currentUserId,
      })),
    );
  },

  listByAuthorId(authorId: string, currentUserId: string) {
    return prisma.post.findMany({
      where: { authorId },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        author: {
          include: {
            profile: true,
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
      },
      take: 100,
    }).then((rows) =>
      rows.map((row) => ({
        id: row.id,
        content: row.content,
        createdAt: row.createdAt,
        author: {
          id: row.authorId,
          name: row.author.name,
          username: row.author.username,
          avatar: row.author.profile?.avatarUrl ?? row.author.image ?? null,
        },
        likeCount: row.likes.length,
        likedByMe: row.likes.some((like) => like.userId === currentUserId),
        isOwner: row.authorId === currentUserId,
      })),
    );
  },

  existsById(postId: string) {
    return prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });
  },
};

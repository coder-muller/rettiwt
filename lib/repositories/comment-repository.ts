import { prisma } from "@/lib/db/prisma";
import type { CommentView } from "@/lib/types/domain";

function mapComment(
  row: {
    id: string;
    postId: string;
    parentCommentId: string | null;
    content: string;
    createdAt: Date;
    deletedAt: Date | null;
    authorId: string;
    author: {
      id: string;
      name: string;
      username: string;
      image: string | null;
      profile: {
        avatarUrl: string | null;
      } | null;
    };
    post: {
      authorId: string;
    };
  },
  currentUserId: string,
): CommentView {
  return {
    id: row.id,
    postId: row.postId,
    parentCommentId: row.parentCommentId,
    content: row.content,
    createdAt: row.createdAt,
    deletedAt: row.deletedAt,
    author: {
      id: row.author.id,
      name: row.author.name,
      username: row.author.username,
      avatar: row.author.profile?.avatarUrl ?? row.author.image ?? null,
    },
    canDelete: !row.deletedAt && (row.authorId === currentUserId || row.post.authorId === currentUserId),
    replies: [],
  };
}

export const commentRepository = {
  create(input: {
    postId: string;
    authorId: string;
    content: string;
    parentCommentId?: string;
  }) {
    return prisma.comment.create({
      data: {
        postId: input.postId,
        authorId: input.authorId,
        content: input.content,
        parentCommentId: input.parentCommentId,
      },
    });
  },

  findById(commentId: string) {
    return prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        post: {
          select: {
            id: true,
            authorId: true,
          },
        },
      },
    });
  },

  softDelete(commentId: string) {
    return prisma.comment.update({
      where: { id: commentId },
      data: {
        deletedAt: new Date(),
      },
    });
  },

  countByPostId(postId: string) {
    return prisma.comment.count({
      where: {
        postId,
      },
    });
  },

  listByPostId(postId: string, currentUserId: string) {
    return prisma.comment
      .findMany({
        where: {
          postId,
        },
        include: {
          author: {
            include: {
              profile: {
                select: {
                  avatarUrl: true,
                },
              },
            },
          },
          post: {
            select: {
              authorId: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
        take: 500,
      })
      .then((rows) => rows.map((row) => mapComment(row, currentUserId)));
  },
};

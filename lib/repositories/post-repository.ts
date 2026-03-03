import { prisma } from "@/lib/db/prisma";
import type { FeedPostView } from "@/lib/types/domain";

type PostRow = {
  id: string;
  content: string;
  createdAt: Date;
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
  likes: {
    userId: string;
  }[];
  comments: {
    id: string;
    postId: string;
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
  }[];
  _count: {
    comments: number;
  };
};

function mapFeedPost(row: PostRow, currentUserId: string): FeedPostView {
  return {
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
    commentCount: row._count.comments,
    commentPreview: row.comments
      .slice()
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .map((comment) => ({
        id: comment.id,
        postId: comment.postId,
        content: comment.content,
        createdAt: comment.createdAt,
        deletedAt: comment.deletedAt,
        author: {
          id: comment.author.id,
          name: comment.author.name,
          username: comment.author.username,
          avatar: comment.author.profile?.avatarUrl ?? comment.author.image ?? null,
        },
        canDelete: !comment.deletedAt && (comment.authorId === currentUserId || row.authorId === currentUserId),
      })),
  };
}

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
    return prisma.post
      .findMany({
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
          comments: {
            where: {
              parentCommentId: null,
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 2,
            include: {
              author: {
                include: {
                  profile: true,
                },
              },
            },
          },
          _count: {
            select: {
              comments: {
                where: {
                  parentCommentId: null,
                  deletedAt: null,
                },
              },
            },
          },
        },
        take: 100,
      })
      .then((rows) => rows.map((row) => mapFeedPost(row, currentUserId)));
  },

  listByAuthorId(authorId: string, currentUserId: string) {
    return prisma.post
      .findMany({
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
          comments: {
            where: {
              parentCommentId: null,
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 2,
            include: {
              author: {
                include: {
                  profile: true,
                },
              },
            },
          },
          _count: {
            select: {
              comments: {
                where: {
                  parentCommentId: null,
                  deletedAt: null,
                },
              },
            },
          },
        },
        take: 100,
      })
      .then((rows) => rows.map((row) => mapFeedPost(row, currentUserId)));
  },

  findFeedPostById(postId: string, currentUserId: string) {
    return prisma.post
      .findUnique({
        where: { id: postId },
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
          comments: {
            where: {
              parentCommentId: null,
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 2,
            include: {
              author: {
                include: {
                  profile: true,
                },
              },
            },
          },
          _count: {
            select: {
              comments: {
                where: {
                  parentCommentId: null,
                  deletedAt: null,
                },
              },
            },
          },
        },
      })
      .then((row) => (row ? mapFeedPost(row, currentUserId) : null));
  },

  findById(postId: string) {
    return prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        authorId: true,
      },
    });
  },

  existsById(postId: string) {
    return prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });
  },
};

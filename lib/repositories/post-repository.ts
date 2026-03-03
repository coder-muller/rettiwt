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
      isFollowedByMe: false,
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
    const FOLLOWING_LIMIT = 80;
    const RECOMMENDED_LIMIT = 80;
    const postInclude = {
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
    } as const;

    return prisma.follow.findMany({
      where: {
        followerId: currentUserId,
      },
      select: {
        followingId: true,
      },
    }).then(async (followRows) => {
      const followingIds = followRows.map((row) => row.followingId);
      const prioritizedAuthorIds = [currentUserId, ...followingIds];
      const followedAuthorSet = new Set(prioritizedAuthorIds);

      const [followingPostsRows, recommendedPostsRows] = await Promise.all([
        prisma.post.findMany({
          where: {
            authorId: {
              in: prioritizedAuthorIds,
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          include: postInclude,
          take: FOLLOWING_LIMIT,
        }),
        prisma.post.findMany({
          where: {
            authorId: {
              notIn: prioritizedAuthorIds,
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          include: postInclude,
          take: RECOMMENDED_LIMIT,
        }),
      ]);

      return {
        followingPosts: followingPostsRows.map((row) => {
          const mapped = mapFeedPost(row, currentUserId);
          return {
            ...mapped,
            author: {
              ...mapped.author,
              isFollowedByMe: followedAuthorSet.has(mapped.author.id),
            },
          };
        }),
        recommendedPosts: recommendedPostsRows.map((row) => {
          const mapped = mapFeedPost(row, currentUserId);
          return {
            ...mapped,
            author: {
              ...mapped.author,
              isFollowedByMe: followedAuthorSet.has(mapped.author.id),
            },
          };
        }),
      };
    });
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
      .then((rows) =>
        rows.map((row) => {
          const mapped = mapFeedPost(row, currentUserId);
          return {
            ...mapped,
            author: {
              ...mapped.author,
              isFollowedByMe: row.authorId === currentUserId,
            },
          };
        }),
      );
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
      .then((row) => {
        if (!row) {
          return null;
        }

        const mapped = mapFeedPost(row, currentUserId);

        return {
          ...mapped,
          author: {
            ...mapped.author,
            isFollowedByMe: row.authorId === currentUserId,
          },
        };
      });
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

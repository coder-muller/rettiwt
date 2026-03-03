import { likeRepository } from "@/lib/repositories/like-repository";
import { postRepository } from "@/lib/repositories/post-repository";
import { notificationService } from "@/lib/services/notification-service";
import { createPostSchema } from "@/lib/validation/post";

export const feedService = {
  listFeed(currentUserId: string) {
    return postRepository.listFeed(currentUserId);
  },

  getPostById(postId: string, currentUserId: string) {
    return postRepository.findFeedPostById(postId, currentUserId);
  },

  async createPost(authorId: string, input: unknown) {
    const parsed = createPostSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false as const,
        fieldErrors: parsed.error.flatten().fieldErrors,
        message: "Post invalido.",
      };
    }

    await postRepository.create({
      authorId,
      content: parsed.data.content,
    });

    return {
      success: true as const,
      message: "Post publicado.",
    };
  },

  async deleteOwnPost(authorId: string, postId: string) {
    const result = await postRepository.deleteByIdAndAuthor(postId, authorId);

    if (result.count === 0) {
      return {
        success: false as const,
        message: "Voce so pode excluir posts proprios.",
      };
    }

    return {
      success: true as const,
      message: "Post excluido.",
    };
  },

  async toggleLike(postId: string, userId: string) {
    const postExists = await postRepository.existsById(postId);

    if (!postExists) {
      return {
        success: false as const,
        message: "Post nao encontrado.",
      };
    }

    const liked = await likeRepository.toggle(postId, userId);

    if (liked) {
      await notificationService.createPostLikedNotification({
        actorId: userId,
        postId,
      });
    } else {
      await notificationService.removePostLikedNotification({
        actorId: userId,
        postId,
      });
    }

    const likeCount = await likeRepository.countByPostId(postId);

    return {
      success: true as const,
      liked,
      likeCount,
    };
  },
};

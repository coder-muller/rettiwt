import { commentRepository } from "@/lib/repositories/comment-repository";
import { postRepository } from "@/lib/repositories/post-repository";
import { notificationService } from "@/lib/services/notification-service";
import { consumeRateLimit } from "@/lib/services/rate-limit-service";
import { createCommentSchema } from "@/lib/validation/comment";

export const commentService = {
  listCommentsByPost(postId: string, currentUserId: string) {
    return commentRepository.listByPostId(postId, currentUserId);
  },

  async createComment(authorId: string, input: unknown) {
    const limit = consumeRateLimit({
      key: `comment:${authorId}`,
      limit: 20,
      windowMs: 5 * 60 * 1000,
    });

    if (!limit.allowed) {
      return {
        success: false as const,
        message: "Muitas tentativas. Aguarde um pouco para comentar novamente.",
      };
    }

    const parsed = createCommentSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false as const,
        fieldErrors: parsed.error.flatten().fieldErrors,
        message: "Comentario invalido.",
      };
    }

    const post = await postRepository.existsById(parsed.data.postId);

    if (!post) {
      return {
        success: false as const,
        message: "Post nao encontrado.",
      };
    }

    const comment = await commentRepository.create({
      postId: parsed.data.postId,
      authorId,
      content: parsed.data.content,
    });

    await notificationService.createPostCommentedNotification({
      actorId: authorId,
      postId: parsed.data.postId,
      commentId: comment.id,
    });

    return {
      success: true as const,
      message: "Comentario publicado.",
      commentId: comment.id,
      postId: parsed.data.postId,
    };
  },

  async deleteComment(commentId: string, currentUserId: string) {
    const comment = await commentRepository.findById(commentId);

    if (!comment) {
      return {
        success: false as const,
        message: "Comentario nao encontrado.",
      };
    }

    if (comment.deletedAt) {
      return {
        success: true as const,
        message: "Comentario ja removido.",
      };
    }

    const canDelete = comment.authorId === currentUserId || comment.post.authorId === currentUserId;

    if (!canDelete) {
      return {
        success: false as const,
        message: "Sem permissao para excluir este comentario.",
      };
    }

    await commentRepository.softDelete(commentId);

    return {
      success: true as const,
      message: "Comentario removido.",
      postId: comment.postId,
    };
  },
};

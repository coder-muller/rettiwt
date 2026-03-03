import { commentRepository } from "@/lib/repositories/comment-repository";
import { postRepository } from "@/lib/repositories/post-repository";
import { notificationService } from "@/lib/services/notification-service";
import { consumeRateLimit } from "@/lib/services/rate-limit-service";
import type { CommentView } from "@/lib/types/domain";
import { createCommentSchema } from "@/lib/validation/comment";

function buildCommentTree(comments: CommentView[]) {
  const byId = new Map<string, CommentView>();
  const roots: CommentView[] = [];

  for (const comment of comments) {
    byId.set(comment.id, {
      ...comment,
      replies: [],
    });
  }

  for (const comment of byId.values()) {
    const parentId = comment.parentCommentId;

    if (!parentId) {
      roots.push(comment);
      continue;
    }

    const parent = byId.get(parentId);

    if (!parent) {
      roots.push(comment);
      continue;
    }

    parent.replies?.push(comment);
  }

  return roots;
}

export const commentService = {
  async listCommentsByPost(postId: string, currentUserId: string) {
    const comments = await commentRepository.listByPostId(postId, currentUserId);
    return buildCommentTree(comments);
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

    const post = await postRepository.findById(parsed.data.postId);

    if (!post) {
      return {
        success: false as const,
        message: "Post nao encontrado.",
      };
    }

    let parentComment: Awaited<ReturnType<typeof commentRepository.findById>> | null = null;

    if (parsed.data.parentCommentId) {
      parentComment = await commentRepository.findById(parsed.data.parentCommentId);

      if (!parentComment || parentComment.postId !== parsed.data.postId) {
        return {
          success: false as const,
          message: "Comentario pai invalido para este post.",
        };
      }
    }

    const comment = await commentRepository.create({
      postId: parsed.data.postId,
      authorId,
      content: parsed.data.content,
      parentCommentId: parsed.data.parentCommentId,
    });

    const shouldNotifyPostOwner = !parentComment || parentComment.authorId !== post.authorId;

    if (shouldNotifyPostOwner) {
      await notificationService.createPostCommentedNotification({
        actorId: authorId,
        postId: parsed.data.postId,
        commentId: comment.id,
      });
    }

    if (parentComment) {
      await notificationService.createCommentRepliedNotification({
        actorId: authorId,
        recipientId: parentComment.authorId,
        postId: parsed.data.postId,
        commentId: comment.id,
      });
    }

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

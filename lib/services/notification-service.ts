import { notificationRepository } from "@/lib/repositories/notification-repository";
import { postRepository } from "@/lib/repositories/post-repository";
import type { NotificationView } from "@/lib/types/domain";

function mapNotification(
  row: {
    id: string;
    type: "POST_LIKED" | "POST_COMMENTED" | "USER_FOLLOWED";
    createdAt: Date;
    readAt: Date | null;
    postId: string | null;
    commentId: string | null;
    actor: {
      id: string;
      name: string;
      username: string;
      image: string | null;
      profile: {
        avatarUrl: string | null;
      } | null;
    };
  },
): NotificationView {
  return {
    id: row.id,
    type: row.type,
    createdAt: row.createdAt,
    readAt: row.readAt,
    postId: row.postId,
    commentId: row.commentId,
    actor: {
      id: row.actor.id,
      name: row.actor.name,
      username: row.actor.username,
      avatar: row.actor.profile?.avatarUrl ?? row.actor.image ?? null,
    },
  };
}

export const notificationService = {
  async createPostLikedNotification(input: { actorId: string; postId: string }) {
    const post = await postRepository.findById(input.postId);

    if (!post || post.authorId === input.actorId) {
      return;
    }

    await notificationRepository.create({
      recipientId: post.authorId,
      actorId: input.actorId,
      type: "POST_LIKED",
      postId: input.postId,
      dedupeKey: `like:${input.postId}:${input.actorId}`,
    });
  },

  removePostLikedNotification(input: { actorId: string; postId: string }) {
    return notificationRepository.deleteByDedupeKey(`like:${input.postId}:${input.actorId}`);
  },

  async createPostCommentedNotification(input: { actorId: string; postId: string; commentId: string }) {
    const post = await postRepository.findById(input.postId);

    if (!post || post.authorId === input.actorId) {
      return;
    }

    await notificationRepository.create({
      recipientId: post.authorId,
      actorId: input.actorId,
      type: "POST_COMMENTED",
      postId: input.postId,
      commentId: input.commentId,
    });
  },

  async createUserFollowedNotification(input: { actorId: string; recipientId: string }) {
    if (input.actorId === input.recipientId) {
      return;
    }

    await notificationRepository.create({
      recipientId: input.recipientId,
      actorId: input.actorId,
      type: "USER_FOLLOWED",
      dedupeKey: `follow:${input.actorId}:${input.recipientId}`,
    });
  },

  removeUserFollowedNotification(input: { actorId: string; recipientId: string }) {
    return notificationRepository.deleteByDedupeKey(`follow:${input.actorId}:${input.recipientId}`);
  },

  async listNotifications(userId: string) {
    const rows = await notificationRepository.listByRecipient(userId);
    return rows.map((row) => mapNotification(row));
  },

  async markRead(userId: string, notificationId: string) {
    const result = await notificationRepository.markRead(notificationId, userId);
    return result.count > 0;
  },

  markAllRead(userId: string) {
    return notificationRepository.markAllRead(userId);
  },

  countUnread(userId: string) {
    return notificationRepository.countUnread(userId);
  },
};

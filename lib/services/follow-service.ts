import { followRepository } from "@/lib/repositories/follow-repository";
import { userRepository } from "@/lib/repositories/user-repository";
import { notificationService } from "@/lib/services/notification-service";
import { consumeRateLimit } from "@/lib/services/rate-limit-service";
import type { UserSearchResult } from "@/lib/types/domain";

function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
}

function mapUserItem(
  row: {
    id: string;
    username: string;
    name: string;
    image: string | null;
    profile: {
      avatarUrl: string | null;
    } | null;
  },
  followedIds: Set<string>,
): UserSearchResult {
  return {
    id: row.id,
    username: row.username,
    name: row.name,
    avatar: row.profile?.avatarUrl ?? row.image ?? null,
    isFollowingByMe: followedIds.has(row.id),
  };
}

export const followService = {
  async followUser(followerId: string, targetUserId: string) {
    const limit = consumeRateLimit({
      key: `follow:${followerId}`,
      limit: 60,
      windowMs: 60 * 60 * 1000,
    });

    if (!limit.allowed) {
      return {
        success: false as const,
        message: "Limite de follows atingido temporariamente. Tente novamente mais tarde.",
      };
    }

    if (followerId === targetUserId) {
      return {
        success: false as const,
        message: "Voce nao pode seguir a si mesmo.",
      };
    }

    const target = await userRepository.findById(targetUserId);

    if (!target) {
      return {
        success: false as const,
        message: "Usuario nao encontrado.",
      };
    }

    await followRepository.follow(followerId, targetUserId);

    await notificationService.createUserFollowedNotification({
      actorId: followerId,
      recipientId: targetUserId,
    });

    return {
      success: true as const,
      message: "Agora voce segue este usuario.",
    };
  },

  async unfollowUser(followerId: string, targetUserId: string) {
    const limit = consumeRateLimit({
      key: `unfollow:${followerId}`,
      limit: 60,
      windowMs: 60 * 60 * 1000,
    });

    if (!limit.allowed) {
      return {
        success: false as const,
        message: "Muitas operacoes de follow/unfollow. Aguarde alguns minutos.",
      };
    }

    if (followerId === targetUserId) {
      return {
        success: false as const,
        message: "Operacao invalida.",
      };
    }

    await followRepository.unfollow(followerId, targetUserId);

    await notificationService.removeUserFollowedNotification({
      actorId: followerId,
      recipientId: targetUserId,
    });

    return {
      success: true as const,
      message: "Voce deixou de seguir este usuario.",
    };
  },

  async listFollowers(username: string, currentUserId: string) {
    const target = await userRepository.findByUsername(normalizeUsername(username));

    if (!target) {
      return null;
    }

    const rows = await followRepository.listFollowers(target.id);
    const followerIds = rows.map((row) => row.followerId);
    const followingIds = new Set(
      await followRepository.listFollowingIdsForFollower(currentUserId, followerIds),
    );

    return {
      target: {
        id: target.id,
        username: target.username,
        name: target.name,
      },
      users: rows.map((row) => mapUserItem(row.follower, followingIds)),
    };
  },

  async listFollowing(username: string, currentUserId: string) {
    const target = await userRepository.findByUsername(normalizeUsername(username));

    if (!target) {
      return null;
    }

    const rows = await followRepository.listFollowing(target.id);
    const followedIds = rows.map((row) => row.followingId);
    const followingIds = new Set(
      await followRepository.listFollowingIdsForFollower(currentUserId, followedIds),
    );

    return {
      target: {
        id: target.id,
        username: target.username,
        name: target.name,
      },
      users: rows.map((row) => mapUserItem(row.following, followingIds)),
    };
  },
};

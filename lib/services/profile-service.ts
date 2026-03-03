import { postRepository } from "@/lib/repositories/post-repository";
import { profileRepository } from "@/lib/repositories/profile-repository";
import { updateProfileSchema } from "@/lib/validation/profile";

function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
}

export const profileService = {
  async ensureProfileForUser(user: {
    id: string;
    name: string;
    image?: string | null;
  }) {
    const existing = await profileRepository.findByUserId(user.id);
    if (existing) {
      return existing;
    }

    return profileRepository.create({
      userId: user.id,
      bio: "",
      avatarUrl: user.image ?? null,
    });
  },

  async getProfileByUsername(username: string, currentUserId: string) {
    const profile = await profileRepository.findByUsername(normalizeUsername(username));

    if (!profile || !profile.user.username) {
      return null;
    }

    const postCount = await profileRepository.countPostsByUserId(profile.userId);

    return {
      userId: profile.userId,
      username: profile.user.username,
      name: profile.user.name,
      bio: profile.bio,
      avatar: profile.avatarUrl ?? profile.user.image ?? null,
      joinedAt: profile.user.createdAt,
      postCount,
      isOwner: profile.userId === currentUserId,
    };
  },

  async getOwnProfile(userId: string) {
    const profile = await profileRepository.findByUserId(userId);

    if (!profile || !profile.user.username) {
      return null;
    }

    return {
      name: profile.user.name,
      username: profile.user.username,
      bio: profile.bio,
      avatarUrl: profile.avatarUrl ?? profile.user.image ?? "",
    };
  },

  async updateOwnProfile(userId: string, input: unknown) {
    const parsed = updateProfileSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false as const,
        fieldErrors: parsed.error.flatten().fieldErrors,
        message: "Dados invalidos.",
      };
    }

    const normalizedUsername = normalizeUsername(parsed.data.username);

    const duplicate = await profileRepository.findUserByUsernameExcludingUser(normalizedUsername, userId);

    if (duplicate) {
      return {
        success: false as const,
        fieldErrors: {
          username: ["Esse username ja esta em uso."],
        },
        message: "Escolha outro username.",
      };
    }

    await profileRepository.updateByUserId(userId, {
      name: parsed.data.name,
      username: normalizedUsername,
      bio: parsed.data.bio,
      avatarUrl: parsed.data.avatarUrl || null,
    });

    return {
      success: true as const,
      message: "Perfil atualizado.",
    };
  },

  listPostsByUserId(userId: string, currentUserId: string) {
    return postRepository.listByAuthorId(userId, currentUserId);
  },
};

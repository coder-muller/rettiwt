import { followRepository } from "@/lib/repositories/follow-repository";
import { userRepository } from "@/lib/repositories/user-repository";
import { userSearchSchema } from "@/lib/validation/search";

function rankUser(user: { username: string; name: string }, query: string, isFollowingByMe: boolean) {
  const q = query.toLowerCase();
  const username = user.username.toLowerCase();
  const name = user.name.toLowerCase();

  let score = 0;

  if (username === q) {
    score += 100;
  } else if (username.startsWith(q)) {
    score += 80;
  } else if (username.includes(q)) {
    score += 40;
  }

  if (name === q) {
    score += 70;
  } else if (name.startsWith(q)) {
    score += 60;
  } else if (name.includes(q)) {
    score += 20;
  }

  if (isFollowingByMe) {
    score += 5;
  }

  return score;
}

export const searchService = {
  async searchUsers(currentUserId: string, input: unknown) {
    const parsed = userSearchSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false as const,
        fieldErrors: parsed.error.flatten().fieldErrors,
        message: "Busca invalida.",
      };
    }

    const rawRows = await userRepository.searchByUsernameOrName(parsed.data.q, parsed.data.limit);

    const filteredRows = rawRows.filter((row) => row.id !== currentUserId);
    const ids = filteredRows.map((row) => row.id);

    const followingIds = new Set(
      await followRepository.listFollowingIdsForFollower(currentUserId, ids),
    );

    const ranked = filteredRows
      .map((row) => {
        const isFollowingByMe = followingIds.has(row.id);

        return {
          id: row.id,
          username: row.username,
          name: row.name,
          avatar: row.profile?.avatarUrl ?? row.image ?? null,
          isFollowingByMe,
          _score: rankUser(row, parsed.data.q, isFollowingByMe),
        };
      })
      .sort((a, b) => {
        if (b._score !== a._score) {
          return b._score - a._score;
        }

        return a.username.localeCompare(b.username);
      })
      .slice(0, parsed.data.limit);

    const users = ranked.map((row) => ({
      id: row.id,
      username: row.username,
      name: row.name,
      avatar: row.avatar,
      isFollowingByMe: row.isFollowingByMe,
    }));

    return {
      success: true as const,
      users,
    };
  },
};

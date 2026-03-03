"use server";

import { revalidatePath } from "next/cache";

import type { ActionState } from "@/lib/actions/action-state";
import { requireSession } from "@/lib/auth/session";
import { followService } from "@/lib/services/follow-service";
import { followTargetSchema } from "@/lib/validation/follow";

function revalidateFollowSurfaces(username?: string) {
  revalidatePath("/feed");
  revalidatePath("/search");
  revalidatePath("/notifications");

  if (username) {
    revalidatePath(`/u/${username}`);
    revalidatePath(`/u/${username}/followers`);
    revalidatePath(`/u/${username}/following`);
  }
}

export async function followUserAction(input: { targetUserId: string; targetUsername?: string }): Promise<ActionState> {
  const session = await requireSession();
  const parsed = followTargetSchema.safeParse({
    targetUserId: input.targetUserId,
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Usuario invalido.",
    };
  }

  const result = await followService.followUser(session.user.id, parsed.data.targetUserId);

  if (!result.success) {
    return {
      status: "error",
      message: result.message,
    };
  }

  revalidateFollowSurfaces(input.targetUsername);

  return {
    status: "success",
    message: result.message,
  };
}

export async function unfollowUserAction(input: { targetUserId: string; targetUsername?: string }): Promise<ActionState> {
  const session = await requireSession();
  const parsed = followTargetSchema.safeParse({
    targetUserId: input.targetUserId,
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Usuario invalido.",
    };
  }

  const result = await followService.unfollowUser(session.user.id, parsed.data.targetUserId);

  if (!result.success) {
    return {
      status: "error",
      message: result.message,
    };
  }

  revalidateFollowSurfaces(input.targetUsername);

  return {
    status: "success",
    message: result.message,
  };
}

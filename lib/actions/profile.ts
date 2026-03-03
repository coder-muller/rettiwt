"use server";

import { revalidatePath } from "next/cache";

import type { ActionState } from "@/lib/actions/action-state";
import { requireSession } from "@/lib/auth/session";
import { profileService } from "@/lib/services/profile-service";

export async function updateProfileAction(input: {
  name: string;
  username: string;
  bio: string;
  avatarUrl: string;
}): Promise<ActionState> {
  const session = await requireSession();

  const result = await profileService.updateOwnProfile(session.user.id, input);

  if (!result.success) {
    return {
      status: "error",
      message: result.message,
      fieldErrors: result.fieldErrors,
    };
  }

  revalidatePath("/settings/profile");
  revalidatePath("/feed");
  revalidatePath(`/u/${input.username.toLowerCase()}`);

  return {
    status: "success",
    message: result.message,
  };
}

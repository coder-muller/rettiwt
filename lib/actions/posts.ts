"use server";

import { revalidatePath } from "next/cache";

import type { ActionState } from "@/lib/actions/action-state";
import { requireSession } from "@/lib/auth/session";
import { feedService } from "@/lib/services/feed-service";
import { postIdSchema } from "@/lib/validation/post";

export async function createPostAction(input: { content: string }): Promise<ActionState> {
  const session = await requireSession();

  const result = await feedService.createPost(session.user.id, {
    content: input.content,
  });

  if (!result.success) {
    return {
      status: "error",
      message: result.message,
      fieldErrors: result.fieldErrors,
    };
  }

  revalidatePath("/feed");

  return {
    status: "success",
    message: result.message,
  };
}

export async function deletePostAction(formData: FormData) {
  const session = await requireSession();
  const parsed = postIdSchema.safeParse({
    postId: formData.get("postId"),
  });

  if (!parsed.success) {
    return;
  }

  const result = await feedService.deleteOwnPost(session.user.id, parsed.data.postId);

  if (!result.success) {
    return;
  }

  revalidatePath("/feed");
  revalidatePath(`/post/${parsed.data.postId}`);
}

export async function toggleLikeAction(formData: FormData) {
  const session = await requireSession();
  const parsed = postIdSchema.safeParse({
    postId: formData.get("postId"),
  });

  if (!parsed.success) {
    return;
  }

  await feedService.toggleLike(parsed.data.postId, session.user.id);

  revalidatePath("/feed");
  revalidatePath(`/post/${parsed.data.postId}`);
}

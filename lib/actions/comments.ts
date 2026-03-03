"use server";

import { revalidatePath } from "next/cache";

import type { ActionState } from "@/lib/actions/action-state";
import { requireSession } from "@/lib/auth/session";
import { commentService } from "@/lib/services/comment-service";
import { commentIdSchema } from "@/lib/validation/comment";

export async function createCommentAction(input: { postId: string; content: string }): Promise<ActionState> {
  const session = await requireSession();

  const result = await commentService.createComment(session.user.id, input);

  if (!result.success) {
    return {
      status: "error",
      message: result.message,
      fieldErrors: result.fieldErrors,
    };
  }

  revalidatePath("/feed");
  revalidatePath(`/post/${result.postId}`);

  return {
    status: "success",
    message: result.message,
  };
}

export async function deleteCommentAction(formData: FormData) {
  const session = await requireSession();
  const parsed = commentIdSchema.safeParse({
    commentId: formData.get("commentId"),
  });

  if (!parsed.success) {
    return;
  }

  const result = await commentService.deleteComment(parsed.data.commentId, session.user.id);

  if (!result.success) {
    return;
  }

  revalidatePath("/feed");
  if (result.postId) {
    revalidatePath(`/post/${result.postId}`);
  }
}

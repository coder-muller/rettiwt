"use server";

import { revalidatePath } from "next/cache";

import type { ActionState } from "@/lib/actions/action-state";
import { requireAdminSession } from "@/lib/auth/session";
import { adminService } from "@/lib/services/admin-service";
import { banUserSchema, removeUserSchema, unbanUserSchema } from "@/lib/validation/admin";

function revalidateAdminSurfaces() {
  revalidatePath("/admin/users");
  revalidatePath("/feed");
  revalidatePath("/search");
  revalidatePath("/notifications");
  revalidatePath("/messages");
}

export async function banUserAction(input: {
  userId: string;
  banReason?: string;
  banExpiresIn?: number;
}): Promise<ActionState> {
  const session = await requireAdminSession();
  const parsed = banUserSchema.safeParse(input);

  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: "Dados invalidos para banimento.",
    };
  }

  const result = await adminService.banUser({
    actorId: session.user.id,
    userId: parsed.data.userId,
    banReason: parsed.data.banReason,
    banExpiresIn: parsed.data.banExpiresIn,
  });

  if (!result.success) {
    return {
      status: "error",
      message: result.message,
    };
  }

  revalidateAdminSurfaces();

  return {
    status: "success",
    message: "Usuario banido com sucesso.",
  };
}

export async function unbanUserAction(input: { userId: string }): Promise<ActionState> {
  await requireAdminSession();
  const parsed = unbanUserSchema.safeParse(input);

  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: "Usuario invalido.",
    };
  }

  const result = await adminService.unbanUser(parsed.data.userId);

  if (!result.success) {
    return {
      status: "error",
      message: result.message,
    };
  }

  revalidateAdminSurfaces();

  return {
    status: "success",
    message: "Banimento removido.",
  };
}

export async function removeUserAction(input: { userId: string }): Promise<ActionState> {
  const session = await requireAdminSession();
  const parsed = removeUserSchema.safeParse(input);

  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: "Usuario invalido.",
    };
  }

  const result = await adminService.removeUser({
    actorId: session.user.id,
    userId: parsed.data.userId,
  });

  if (!result.success) {
    return {
      status: "error",
      message: result.message,
    };
  }

  revalidateAdminSurfaces();

  return {
    status: "success",
    message: "Usuario removido.",
  };
}

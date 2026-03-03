import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { isAdminRole } from "@/lib/auth/roles";
import { auth } from "@/lib/auth/server";
import { prisma } from "@/lib/db/prisma";

function isBanActive(user: {
  banned?: boolean | null;
  banExpires?: Date | string | null;
}) {
  if (!user.banned) {
    return false;
  }

  if (!user.banExpires) {
    return true;
  }

  const expiresAt = new Date(user.banExpires);

  if (Number.isNaN(expiresAt.getTime())) {
    return true;
  }

  return expiresAt.getTime() > Date.now();
}

export async function getRawSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

export async function getSession() {
  const session = await getRawSession();

  if (!session) {
    return null;
  }

  if (!isBanActive(session.user)) {
    return session;
  }

  await prisma.session.deleteMany({
    where: {
      token: session.session.token,
    },
  });

  return null;
}

export async function requireSession() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function getVerifiedSession() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  if (!session.user.emailVerified) {
    return null;
  }

  return session;
}

export async function requireVerifiedSession() {
  const session = await requireSession();

  if (!session.user.emailVerified) {
    redirect(`/verify-email?email=${encodeURIComponent(session.user.email)}`);
  }

  return session;
}

export async function requireAdminSession() {
  const session = await requireSession();

  if (!isAdminRole(session.user.role)) {
    redirect("/feed");
  }

  return session;
}

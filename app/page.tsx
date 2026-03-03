import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth/session";

export default async function HomePage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  redirect(session.user.emailVerified ? "/feed" : `/verify-email?email=${encodeURIComponent(session.user.email)}`);
}

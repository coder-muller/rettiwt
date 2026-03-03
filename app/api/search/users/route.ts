import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth/session";
import { searchService } from "@/lib/services/search-service";

export async function GET(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const limit = searchParams.get("limit") ?? "10";

  const result = await searchService.searchUsers(session.user.id, {
    q,
    limit,
  });

  if (!result.success) {
    return NextResponse.json({ message: result.message }, { status: 400 });
  }

  return NextResponse.json({ users: result.users });
}

import Link from "next/link";

import { FollowToggleButton } from "@/components/follow/follow-toggle-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { UserSearchResult } from "@/lib/types/domain";

function initials(name: string) {
  const parts = name.trim().split(" ").filter(Boolean);
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

type UserListItemProps = {
  user: UserSearchResult;
};

export function UserListItem({ user }: UserListItemProps) {
  return (
    <article className="flex items-center justify-between gap-3 border-b px-4 py-3 transition-colors hover:bg-accent/30">
      <Link
        href={`/u/${user.username}`}
        className="flex min-w-0 items-center gap-3"
      >
        <Avatar className="size-10">
          <AvatarImage alt={user.name} src={user.avatar ?? undefined} />
          <AvatarFallback>{initials(user.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-[15px] font-bold">{user.name}</p>
          <p className="truncate text-[13px] text-muted-foreground">
            @{user.username}
          </p>
        </div>
      </Link>

      <FollowToggleButton
        targetUserId={user.id}
        targetUsername={user.username}
        isFollowingByMe={user.isFollowingByMe}
      />
    </article>
  );
}

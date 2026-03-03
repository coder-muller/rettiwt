"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { followUserAction, unfollowUserAction } from "@/lib/actions/follows";
import { Button } from "@/components/ui/button";

type FollowToggleButtonProps = {
  targetUserId: string;
  targetUsername: string;
  isFollowingByMe: boolean;
};

export function FollowToggleButton({
  targetUserId,
  targetUsername,
  isFollowingByMe,
}: FollowToggleButtonProps) {
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(isFollowingByMe);
  const [isPending, startTransition] = useTransition();

  function onClick() {
    startTransition(async () => {
      const action = isFollowing ? unfollowUserAction : followUserAction;

      const result = await action({
        targetUserId,
        targetUsername,
      });

      if (result.status === "success") {
        setIsFollowing((current) => !current);
        router.refresh();
      }
    });
  }

  return (
    <Button
      type="button"
      variant={isFollowing ? "outline" : "default"}
      size="sm"
      className="rounded-full"
      disabled={isPending}
      onClick={onClick}
    >
      {isPending ? "..." : isFollowing ? "Seguindo" : "Seguir"}
    </Button>
  );
}

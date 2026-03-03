"use client";

import { useFormStatus } from "react-dom";
import { Heart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LikeButtonProps = {
  likedByMe: boolean;
  likeCount: number;
};

export function LikeButton({ likedByMe, likeCount }: LikeButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant="ghost"
      size="sm"
      aria-label={likedByMe ? "Descurtir post" : "Curtir post"}
      disabled={pending}
      className={cn(
        "h-8 rounded-full px-2 text-muted-foreground hover:bg-muted",
        likedByMe && "text-foreground",
      )}
    >
      <Heart className={cn("size-4", likedByMe && "fill-current")} />
      <span className="tabular-nums">{likeCount}</span>
    </Button>
  );
}

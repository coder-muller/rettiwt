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
        "h-8 gap-1.5 rounded-full px-2",
        likedByMe
          ? "text-rose-500 hover:bg-rose-500/10 hover:text-rose-600"
          : "text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500",
      )}
    >
      <Heart className={cn("size-[18px]", likedByMe && "fill-current")} />
      <span className="text-[13px] tabular-nums">{likeCount || ""}</span>
    </Button>
  );
}

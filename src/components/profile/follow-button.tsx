"use client";

import * as React from "react";
import { toast } from "sonner";
import { Check, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleFollowAction } from "@/lib/actions/interactions";

export function FollowButton({
  targetId,
  targetUsername,
  initialFollowing,
  size = "sm",
  variant = "default",
  className,
}: {
  targetId: string;
  targetUsername?: string;
  initialFollowing: boolean;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "outline" | "secondary";
  className?: string;
}) {
  const [following, setFollowing] = React.useState(initialFollowing);
  const [pending, startTransition] = React.useTransition();

  React.useEffect(() => setFollowing(initialFollowing), [initialFollowing]);

  function onClick() {
    const next = !following;
    setFollowing(next);
    startTransition(async () => {
      try {
        await toggleFollowAction(targetId, targetUsername);
      } catch {
        setFollowing(!next);
        toast.error("Couldn't update follow");
      }
    });
  }

  return (
    <Button
      size={size}
      variant={following ? "outline" : variant}
      onClick={onClick}
      disabled={pending}
      className={className}
      aria-pressed={following}
    >
      {following ? (
        <>
          <Check className="size-4" /> Following
        </>
      ) : (
        <>
          <UserPlus className="size-4" /> Follow
        </>
      )}
    </Button>
  );
}

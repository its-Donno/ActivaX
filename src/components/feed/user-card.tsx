import Link from "next/link";
import { UserAvatar } from "@/components/common/user-avatar";
import { FollowButton } from "@/components/profile/follow-button";
import type { ProfileSummary } from "@/lib/types";
import { pluralize } from "@/lib/format";

export function UserCard({
  user,
  following,
  mutualCount,
  viewerId,
}: {
  user: ProfileSummary;
  following?: boolean;
  mutualCount?: number;
  viewerId: string | null;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-card p-3.5 ring-1 ring-foreground/10">
      <UserAvatar user={user} size="lg" />
      <div className="min-w-0 flex-1">
        <Link
          href={`/u/${user.username}`}
          className="block truncate font-medium hover:underline"
        >
          {user.displayName}
        </Link>
        <p className="truncate text-xs text-muted-foreground">
          @{user.username}
        </p>
        {user.bio && (
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {user.bio}
          </p>
        )}
        {mutualCount && mutualCount > 0 ? (
          <p className="mt-1 text-[11px] text-muted-foreground">
            {pluralize(mutualCount, "mutual connection")}
          </p>
        ) : null}
      </div>
      {viewerId !== user.id && (
        <FollowButton
          targetId={user.id}
          targetUsername={user.username}
          initialFollowing={Boolean(following)}
        />
      )}
    </div>
  );
}

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials } from "@/lib/format";
import type { ProfileSummary } from "@/lib/types";

export function UserAvatar({
  user,
  size = "default",
  className,
  link = true,
}: {
  user: Pick<ProfileSummary, "username" | "displayName" | "avatarUrl">;
  size?: "sm" | "default" | "lg";
  className?: string;
  link?: boolean;
}) {
  const avatar = (
    <Avatar size={size} className={className}>
      {user.avatarUrl ? (
        <AvatarImage src={user.avatarUrl} alt={user.displayName} />
      ) : null}
      <AvatarFallback className="text-xs font-medium">
        {initials(user.displayName || user.username)}
      </AvatarFallback>
    </Avatar>
  );

  if (!link) return avatar;
  return <Link href={`/u/${user.username}`}>{avatar}</Link>;
}

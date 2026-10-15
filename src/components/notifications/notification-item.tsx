import Link from "next/link";
import { UserAvatar } from "@/components/common/user-avatar";
import type { NotificationWithActor } from "@/lib/types";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

export function NotificationItem({
  notification,
}: {
  notification: NotificationWithActor;
}) {
  const actor = notification.actor;
  const link = notification.actionId
    ? `/actions/${notification.actionId}`
    : actor
      ? `/u/${actor.username}`
      : "#";

  return (
    <Link
      href={link}
      className={cn(
        "flex items-start gap-3 rounded-xl border p-3 transition-colors hover:bg-muted/60",
        !notification.read && "border-primary/40 bg-primary/5",
      )}
    >
      {actor && <UserAvatar user={actor} />}
      <div className="min-w-0 flex-1">
        <p className="text-sm">
          {actor ? (
            <span className="font-medium">{actor.displayName}</span>
          ) : (
            "Someone"
          )}{" "}
          {notification.message}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {timeAgo(notification.createdAt)}
        </p>
      </div>
    </Link>
  );
}

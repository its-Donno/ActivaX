import Link from "next/link";
import { UserAvatar } from "@/components/common/user-avatar";
import type { ConversationSummary } from "@/lib/types";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

export function ConversationList({
  conversations,
}: {
  conversations: ConversationSummary[];
}) {
  return (
    <div className="rounded-xl bg-card ring-1 ring-foreground/10">
      {conversations.map((c) => {
        const other = c.participants[0];
        if (!other) return null;
        return (
          <Link
            key={c.id}
            href={`/messages/${c.id}`}
            className={cn(
              "flex items-center gap-3 border-b p-3 last:border-0 hover:bg-muted/60",
              c.unreadCount > 0 && "bg-primary/5",
            )}
          >
            <UserAvatar user={other} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="font-medium">{other.displayName}</p>
                <p className="text-xs text-muted-foreground">
                  {c.lastMessage ? timeAgo(c.lastMessage.createdAt) : timeAgo(c.updatedAt)}
                </p>
              </div>
              <p className="truncate text-sm text-muted-foreground">
                {c.lastMessage ? c.lastMessage.body : "No messages yet"}
              </p>
            </div>
            {c.unreadCount > 0 && (
              <span className="grid min-w-5 place-items-center rounded-full bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
                {c.unreadCount}
              </span>
            )}
          </Link>
        );
      })}
      {conversations.length === 0 && (
        <div className="p-6 text-center text-sm text-muted-foreground">
          No conversations yet. Start a chat from a profile.
        </div>
      )}
    </div>
  );
}

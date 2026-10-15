import Link from "next/link";
import Image from "next/image";
import { CalendarDays, MapPin } from "lucide-react";
import { ActionTypeBadge, CategoryBadge } from "./action-badges";
import { ActionInteractions } from "./action-interactions";
import { UserAvatar } from "@/components/common/user-avatar";
import type { ActionWithMeta } from "@/lib/types";
import { formatDate, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

export function FeedCard({
  action,
  viewerId,
}: {
  action: ActionWithMeta;
  viewerId: string | null;
}) {
  const isOwner = viewerId === action.authorId;

  return (
    <article className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 transition-shadow hover:shadow-sm">
      <div className="flex items-start gap-3 p-4 pb-3">
        <UserAvatar user={action.author} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-1.5 text-sm">
            <Link
              href={`/u/${action.author.username}`}
              className="font-medium hover:underline"
            >
              {action.author.displayName}
            </Link>
            <span className="text-muted-foreground">
              @{action.author.username}
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">
              {timeAgo(action.createdAt)}
            </span>
          </div>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {action.author.bio || "Member of Activa"}
          </p>
        </div>
        <ActionTypeBadge type={action.type} />
      </div>

      <Link href={`/actions/${action.id}`} className="block px-4">
        <h2 className="text-base leading-snug font-semibold tracking-tight sm:text-[1.05rem]">
          {action.title}
        </h2>
        <p className="mt-1.5 line-clamp-4 text-sm whitespace-pre-line text-muted-foreground">
          {action.description}
        </p>
      </Link>

      {action.mediaUrl && (
        <Link href={`/actions/${action.id}`} className="mt-3 block">
          <div className="relative aspect-[16/9] w-full bg-muted">
            <Image
              src={action.mediaUrl}
              alt={action.title}
              fill
              sizes="(max-width: 768px) 100vw, 600px"
              className="object-cover"
            />
          </div>
        </Link>
      )}

      <div className="flex flex-wrap items-center gap-2 px-4 pt-3">
        <CategoryBadge category={action.category} />
        {action.location && (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3.5" />
            {action.location}
          </span>
        )}
        {action.eventDate && (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <CalendarDays className="size-3.5" />
            {formatDate(action.eventDate)}
          </span>
        )}
      </div>

      {action.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-4 pt-2">
          {action.tags.slice(0, 5).map((tag) => (
            <Link
              key={tag}
              href={`/explore?search=${encodeURIComponent(tag)}`}
              className="text-xs text-muted-foreground hover:text-primary"
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}

      <div
        className={cn(
          "mt-3 border-t border-border/70 px-4 py-3",
          "flex flex-wrap items-center gap-2",
        )}
      >
        <ActionInteractions
          actionId={action.id}
          type={action.type}
          isOwner={isOwner}
          initial={{
            liked: action.liked,
            saved: action.saved,
            joined: action.joined,
            likeCount: action.likeCount,
            commentCount: action.commentCount,
            participantCount: action.participantCount,
            participantLimit: action.participantLimit,
          }}
        />
      </div>
    </article>
  );
}

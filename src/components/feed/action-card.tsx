import Link from "next/link";
import Image from "next/image";
import { CalendarDays, MapPin } from "lucide-react";
import { ActionTypeBadge } from "./action-badges";
import { UserAvatar } from "@/components/common/user-avatar";
import type { ActionWithMeta } from "@/lib/types";
import { CATEGORIES } from "@/lib/constants";
import { formatDate, pluralize } from "@/lib/format";
import { cn } from "@/lib/utils";

export function ActionCard({
  action,
  showAuthor = true,
  className,
}: {
  action: ActionWithMeta;
  showAuthor?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={`/actions/${action.id}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 transition-shadow hover:shadow-sm",
        className,
      )}
    >
      {action.mediaUrl ? (
        <div className="relative aspect-[16/9] w-full bg-muted">
          <Image
            src={action.mediaUrl}
            alt={action.title}
            fill
            sizes="(max-width: 768px) 100vw, 320px"
            className="object-cover transition-transform group-hover:scale-[1.02]"
          />
        </div>
      ) : (
        <div className="flex aspect-[16/9] w-full items-center justify-center bg-muted text-4xl">
          {CATEGORIES[action.category].emoji}
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <div className="flex items-center justify-between gap-2">
          <ActionTypeBadge type={action.type} />
          <span className="text-xs text-muted-foreground">
            {CATEGORIES[action.category].label}
          </span>
        </div>
        <h3 className="line-clamp-2 font-medium leading-snug group-hover:text-primary">
          {action.title}
        </h3>
        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {action.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" />
              <span className="line-clamp-1">{action.location}</span>
            </span>
          )}
          {action.eventDate && (
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="size-3.5" />
              {formatDate(action.eventDate)}
            </span>
          )}
          {action.participantCount > 0 && (
            <span>{pluralize(action.participantCount, "person", "people")}</span>
          )}
        </div>
        {showAuthor && (
          <div className="flex items-center gap-2 border-t border-border/60 pt-2.5">
            <UserAvatar user={action.author} size="sm" link={false} />
            <span className="truncate text-xs text-muted-foreground">
              {action.author.displayName}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

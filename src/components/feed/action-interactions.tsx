"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Bookmark,
  Check,
  ChevronDown,
  Handshake,
  Heart,
  MessageCircle,
  Share2,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ACTION_TYPES } from "@/lib/constants";
import type { ActionType } from "@/lib/types";
import {
  joinActionAction,
  leaveActionAction,
} from "@/lib/actions/actions";
import { toggleLikeAction, toggleSaveAction } from "@/lib/actions/interactions";

const TYPE_ICON: Record<ActionType, React.ElementType> = {
  ask: Handshake,
  help: Handshake,
  join: Users,
  project: Users,
  try: Sparkles,
  share: Sparkles,
};

export interface InteractionInitial {
  liked: boolean;
  saved: boolean;
  joined: boolean;
  likeCount: number;
  commentCount: number;
  participantCount: number;
  participantLimit: number | null;
}

export function ActionInteractions({
  actionId,
  type,
  initial,
  isOwner = false,
  variant = "feed",
}: {
  actionId: string;
  type: ActionType;
  initial: InteractionInitial;
  isOwner?: boolean;
  variant?: "feed" | "detail";
}) {
  const router = useRouter();
  const config = ACTION_TYPES[type];
  const CtaIcon = TYPE_ICON[type];

  const [liked, setLiked] = React.useState(initial.liked);
  const [likeCount, setLikeCount] = React.useState(initial.likeCount);
  const [saved, setSaved] = React.useState(initial.saved);
  const [joined, setJoined] = React.useState(initial.joined);
  const [participantCount, setParticipantCount] = React.useState(
    initial.participantCount,
  );
  const [pending, startTransition] = React.useTransition();

  React.useEffect(() => {
    setLiked(initial.liked);
    setLikeCount(initial.likeCount);
    setSaved(initial.saved);
    setJoined(initial.joined);
    setParticipantCount(initial.participantCount);
  }, [initial]);

  const isFull =
    initial.participantLimit !== null &&
    participantCount >= initial.participantLimit;
  const joinable = type === "join" || type === "project" || type === "help";

  function onLike() {
    const next = !liked;
    setLiked(next);
    setLikeCount((c) => c + (next ? 1 : -1));
    startTransition(async () => {
      try {
        await toggleLikeAction(actionId);
      } catch {
        setLiked(!next);
        setLikeCount((c) => c + (next ? -1 : 1));
        toast.error("Couldn't update your like");
      }
    });
  }

  function onSave() {
    const next = !saved;
    setSaved(next);
    startTransition(async () => {
      try {
        await toggleSaveAction(actionId);
        toast.success(next ? "Saved to your collection" : "Removed from saved");
      } catch {
        setSaved(!next);
        toast.error("Couldn't update saved items");
      }
    });
  }

  function onJoin() {
    if (isFull && !joined) {
      toast.error("This action is full");
      return;
    }
    startTransition(async () => {
      const result = await joinActionAction(actionId, config.role);
      if (result.ok) {
        setJoined(true);
        setParticipantCount((c) => c + 1);
        toast.success(
          joinable ? `You're in — ${config.verb.toLowerCase()}!` : "Interest sent",
        );
        router.refresh();
      } else if (result.reason === "full") {
        toast.error("This action is full");
      } else if (result.reason === "duplicate") {
        setJoined(true);
      } else {
        toast.error("Something went wrong");
      }
    });
  }

  function onLeave() {
    startTransition(async () => {
      const result = await leaveActionAction(actionId);
      if (result.ok) {
        setJoined(false);
        setParticipantCount((c) => Math.max(0, c - 1));
        toast("You left this action");
        router.refresh();
      } else {
        toast.error("Organizers can't leave their own action");
      }
    });
  }

  function onShare() {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/actions/${actionId}`
        : `/actions/${actionId}`;
    navigator.clipboard
      ?.writeText(url)
      .then(() => toast.success("Link copied to clipboard"))
      .catch(() => toast.error("Couldn't copy link"));
  }

  const countLabel =
    initial.participantLimit !== null
      ? `${participantCount} / ${initial.participantLimit} joined`
      : `${participantCount} ${config.verb.toLowerCase()}`;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2",
        variant === "detail" && "gap-3",
      )}
    >
      {isOwner && !joined ? (
        <Button variant="outline" size={variant === "detail" ? "lg" : "default"} disabled>
          <Check className="size-4" /> Your action
        </Button>
      ) : joined ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              size={variant === "detail" ? "lg" : "default"}
              disabled={pending}
            >
              <Check className="size-4" />
              {config.verb}
              <ChevronDown className="size-3.5 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem asChild>
              <Link href={`/actions/${actionId}#participants`}>
                <Users className="size-4" /> View participants
              </Link>
            </DropdownMenuItem>
            {!isOwner && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onSelect={onLeave}>
                  Leave
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button
          size={variant === "detail" ? "lg" : "default"}
          onClick={onJoin}
          disabled={pending || (isFull && !joined)}
          className="shadow-sm"
        >
          <CtaIcon className="size-4" />
          {isFull ? "Full" : config.cta}
        </Button>
      )}

      {(participantCount > 0 || initial.participantLimit !== null) && (
        <span
          className={cn(
            "text-xs text-muted-foreground",
            variant === "detail" && "text-sm",
          )}
        >
          {countLabel}
        </span>
      )}

      <div className="ml-auto flex items-center gap-0.5">
        <Button
          variant="ghost"
          size={variant === "detail" ? "icon" : "icon-sm"}
          onClick={onLike}
          disabled={pending}
          aria-pressed={liked}
          aria-label={liked ? "Unlike" : "Like"}
          className={cn(liked && "text-rose-500 hover:text-rose-500")}
        >
          <Heart className={cn("size-4", liked && "fill-current")} />
        </Button>
        {likeCount > 0 && (
          <span className="mr-1 tabular-nums text-xs text-muted-foreground">
            {likeCount}
          </span>
        )}

        <Button
          variant="ghost"
          size={variant === "detail" ? "icon" : "icon-sm"}
          asChild
          aria-label="Comments"
        >
          <Link href={`/actions/${actionId}#comments`}>
            <MessageCircle className="size-4" />
          </Link>
        </Button>
        {initial.commentCount > 0 && (
          <span className="mr-1 tabular-nums text-xs text-muted-foreground">
            {initial.commentCount}
          </span>
        )}

        <Button
          variant="ghost"
          size={variant === "detail" ? "icon" : "icon-sm"}
          onClick={onSave}
          disabled={pending}
          aria-pressed={saved}
          aria-label={saved ? "Remove from saved" : "Save"}
          className={cn(saved && "text-primary hover:text-primary")}
        >
          <Bookmark className={cn("size-4", saved && "fill-current")} />
        </Button>

        <Button
          variant="ghost"
          size={variant === "detail" ? "icon" : "icon-sm"}
          onClick={onShare}
          aria-label="Share"
        >
          <Share2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}

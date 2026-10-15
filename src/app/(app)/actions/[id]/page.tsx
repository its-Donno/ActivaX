import { getCurrentUser } from "@/lib/auth/session";
import { getAction, getComments, getParticipants } from "@/lib/data/actions";
import { redirect, notFound } from "next/navigation";
import { UserAvatar } from "@/components/common/user-avatar";
import { ActionInteractions } from "@/components/feed/action-interactions";
import { CategoryBadge, ActionTypeBadge } from "@/components/feed/action-badges";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatDateTime, pluralize } from "@/lib/format";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { CommentSection } from "@/components/action/comment-section";
import { Avatar, AvatarGroup, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials } from "@/lib/format";
import Image from "next/image";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const action = await getAction(id, null);
  return { title: action ? action.title : "Action" };
}

export default async function ActionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { id } = await params;
  const action = await getAction(id, user.id);
  if (!action) notFound();
  const [comments, participants] = await Promise.all([
    getComments(id),
    getParticipants(id),
  ]);

  return (
    <div className="space-y-5">
      <article className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
        {action.mediaUrl && (
          <div className="relative aspect-[21/9] w-full bg-muted">
            <Image
              src={action.mediaUrl}
              alt={action.title}
              fill
              sizes="(max-width: 768px) 100vw, 800px"
              className="object-cover"
            />
          </div>
        )}
        <div className="flex flex-col gap-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <UserAvatar user={action.author} />
              <div>
                <p className="font-medium">{action.author.displayName}</p>
                <p className="text-xs text-muted-foreground">
                  @{action.author.username} · {formatDateTime(action.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CategoryBadge category={action.category} />
              <ActionTypeBadge type={action.type} />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              {action.title}
            </h1>
            <p className="whitespace-pre-line leading-relaxed text-muted-foreground">
              {action.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {action.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-4" />
                {action.location}
              </span>
            )}
            {action.eventDate && (
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-4" />
                {formatDate(action.eventDate)}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Users className="size-4" />
              {pluralize(participants.length, "participant")}
            </span>
          </div>

          {participants.length > 0 && (
            <div className="flex items-center gap-3">
              <AvatarGroup>
                {participants.slice(0, 6).map((p) => (
                  <Avatar key={p.id} size="sm">
                    {p.profile?.avatarUrl ? (
                      <AvatarImage src={p.profile.avatarUrl} alt={p.profile.displayName} />
                    ) : null}
                    <AvatarFallback className="text-[10px]">
                      {initials(p.profile?.displayName || p.profile?.username || "")}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </AvatarGroup>
              {participants.length > 6 && (
                <span className="text-sm text-muted-foreground">
                  +{participants.length - 6} more
                </span>
              )}
            </div>
          )}

          {action.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {action.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          <ActionInteractions
            actionId={action.id}
            type={action.type}
            isOwner={user.id === action.authorId}
            variant="detail"
            initial={{
              liked: action.liked,
              saved: action.saved,
              joined: action.joined,
              likeCount: action.likeCount,
              commentCount: action.commentCount,
              participantCount: participants.length,
              participantLimit: action.participantLimit,
            }}
          />
        </div>
      </article>

      <section
        id="comments"
        className="rounded-xl bg-card p-5 ring-1 ring-foreground/10"
      >
        <h2 className="mb-4 text-lg font-semibold">Comments</h2>
        <CommentSection actionId={action.id} comments={comments} userId={user.id} />
      </section>

      <section id="participants" className="rounded-xl bg-card p-5 ring-1 ring-foreground/10">
        <h2 className="mb-4 text-lg font-semibold">Participants</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {participants.map((p) => (
            <div key={p.id} className="flex items-center gap-3 rounded-lg border p-3">
              {p.profile && <UserAvatar user={p.profile} />}
              <div>
                <p className="font-medium">{p.profile?.displayName ?? "Member"}</p>
                <p className="text-xs text-muted-foreground">
                  @{p.profile?.username ?? "unknown"} · {p.role}
                </p>
              </div>
            </div>
          ))}
          {participants.length === 0 && (
            <p className="text-sm text-muted-foreground">No participants yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}

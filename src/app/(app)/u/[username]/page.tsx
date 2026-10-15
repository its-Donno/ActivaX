import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { getProfileByUsername, getProfileStats, isFollowing } from "@/lib/data/profiles";
import { getActionsByAuthor, getJoinedActions } from "@/lib/data/actions";
import { FeedCard } from "@/components/feed/feed-card";
import { ActionCard } from "@/components/feed/action-card";
import { UserAvatar } from "@/components/common/user-avatar";
import { FollowButton } from "@/components/profile/follow-button";
import { MessageButton } from "@/components/profile/message-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  return { title: `@${username}` };
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const me = await getCurrentUser();
  if (!me) redirect("/login");
  const { username } = await params;
  const profile = await getProfileByUsername(username);
  if (!profile) redirect("/home");
  const [stats, created, joined, following] = await Promise.all([
    getProfileStats(profile.id),
    getActionsByAuthor(profile.id, me.id),
    getJoinedActions(profile.id, me.id),
    isFollowing(me.id, profile.id),
  ]);
  const isMe = me.id === profile.id;

  return (
    <div className="space-y-5">
      <div className="rounded-xl bg-card p-5 ring-1 ring-foreground/10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <UserAvatar user={profile} size="lg" link={false} />
            <div>
              <h1 className="text-xl font-semibold">{profile.displayName}</h1>
              <p className="text-sm text-muted-foreground">@{profile.username}</p>
              {profile.bio && (
                <p className="mt-2 max-w-xl whitespace-pre-line text-sm text-muted-foreground">
                  {profile.bio}
                </p>
              )}
              {profile.location && (
                <p className="mt-2 text-sm text-muted-foreground">{profile.location}</p>
              )}
              <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span>{stats.followerCount} followers</span>
                <span>{stats.followingCount} following</span>
                <span>{stats.createdCount} actions created</span>
                <span>{stats.joinedCount} joined</span>
                <span>{stats.helpedCount} helped</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {!isMe && (
              <>
                <FollowButton
                  targetId={profile.id}
                  targetUsername={profile.username}
                  initialFollowing={following}
                />
                <MessageButton userId={profile.id} />
              </>
            )}
            {isMe && (
              <Button variant="outline" asChild>
                <Link href="/profile/edit">Edit profile</Link>
              </Button>
            )}
          </div>
        </div>

        {profile.interests.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium">Interests</p>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((i) => (
                <span
                  key={i}
                  className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground"
                >
                  {i}
                </span>
              ))}
            </div>
          </div>
        )}

        {(profile.skillsOffered.length > 0 || profile.skillsWanted.length > 0) && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {profile.skillsOffered.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Skills offered</p>
                <div className="flex flex-wrap gap-2">
                  {profile.skillsOffered.map((s) => (
                    <span
                      key={s}
                      className="rounded-full border px-2.5 py-1 text-xs"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {profile.skillsWanted.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Skills wanted</p>
                <div className="flex flex-wrap gap-2">
                  {profile.skillsWanted.map((s) => (
                    <span
                      key={s}
                      className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Tabs defaultValue="posts">
        <TabsList className="grid w-full grid-cols-3 sm:w-fit">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="actions">Joined</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>
        <TabsContent value="posts" className="mt-4 space-y-4">
          {created.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {isMe ? "You haven't created any actions yet." : "No actions created yet."}
            </p>
          )}
          {created.map((a) => (
            <FeedCard key={a.id} action={a} viewerId={me.id} />
          ))}
        </TabsContent>
        <TabsContent value="actions" className="mt-4 space-y-4">
          {joined.length === 0 && (
            <p className="text-sm text-muted-foreground">No joined actions yet.</p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            {joined.map((a) => (
              <ActionCard key={a.id} action={a} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="about" className="mt-4">
          <div className="rounded-xl bg-card p-5 text-sm text-muted-foreground ring-1 ring-foreground/10">
            {profile.bio || "No bio provided."}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

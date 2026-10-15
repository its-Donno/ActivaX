import { ActionCard } from "@/components/feed/action-card";
import { UserCard } from "@/components/feed/user-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getTrendingActions } from "@/lib/data/actions";
import { getSuggestedPeople, isFollowing } from "@/lib/data/profiles";
import { getCurrentUser } from "@/lib/auth/session";

export async function RightRail() {
  const me = await getCurrentUser();
  const viewerId = me?.id ?? null;
  const [trending, suggested] = await Promise.all([
    getTrendingActions(viewerId, 5),
    getSuggestedPeople(viewerId, 5),
  ]);

  return (
    <aside className="hidden w-80 shrink-0 xl:block">
      <div className="sticky top-16 flex max-h-[calc(100vh-4rem)] flex-col gap-5 overflow-auto pb-8">
        <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Suggested people</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/explore">See all</Link>
            </Button>
          </div>
          <div className="mt-3 flex flex-col gap-2">
            {suggested.map(async (p) => {
              const following = viewerId ? await isFollowing(viewerId, p.id) : false;
              return (
                <UserCard
                  key={p.id}
                  user={p}
                  mutualCount={p.mutualCount}
                  following={following}
                  viewerId={viewerId}
                />
              );
            })}
          </div>
        </div>

        <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
          <h2 className="text-sm font-semibold">Trending actions</h2>
          <div className="mt-3 flex flex-col gap-2">
            {trending.map((t) => (
              <ActionCard key={t.id} action={t} showAuthor={false} className="shadow-none ring-1 ring-border/60" />
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

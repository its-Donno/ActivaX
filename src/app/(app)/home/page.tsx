import { requireUser } from "@/lib/auth/session";
import { getFeed } from "@/lib/data/actions";
import { FeedCard } from "@/components/feed/feed-card";
import { FeedSkeleton } from "@/components/common/loading-skeletons";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { Suspense } from "react";

export const metadata = { title: "Home" };

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const user = await requireUser();
  const sp = await searchParams;
  const tab = sp.tab === "following" ? "following" : "for-you";

  async function Feed() {
    const actions = await getFeed({
      viewerId: user.id,
      tab,
    });
    if (actions.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed px-6 py-12 text-center">
          <h2 className="text-lg font-medium">
            {tab === "following" ? "You're not following anyone yet" : "No actions to show yet"}
          </h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            {tab === "following"
              ? "Follow people you resonate with to see their actions in your feed."
              : "Start by exploring what's happening or create your first action."}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/explore">Explore</Link>
            </Button>
            <Button asChild>
              <Link href="/create">Create action</Link>
            </Button>
          </div>
        </div>
      );
    }
    return (
      <div className="space-y-4">
        {actions.map((a) => (
          <FeedCard key={a.id} action={a} viewerId={user.id} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Home</h1>
        <Button asChild className="md:hidden">
          <Link href="/create">Create</Link>
        </Button>
      </div>
      <Tabs defaultValue={tab} value={tab}>
        <TabsList className="grid w-full grid-cols-2 sm:w-fit">
          <TabsTrigger value="for-you" asChild>
            <Link href="/home?tab=for-you">For You</Link>
          </TabsTrigger>
          <TabsTrigger value="following" asChild>
            <Link href="/home?tab=following">Following</Link>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="for-you" className="mt-4">
          <Suspense fallback={<FeedSkeleton />}>
            <Feed />
          </Suspense>
        </TabsContent>
        <TabsContent value="following" className="mt-4">
          <Suspense fallback={<FeedSkeleton />}>
            <Feed />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}

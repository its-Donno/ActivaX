import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { getExploreData } from "@/lib/data/actions";
import { getSuggestedPeople, searchProfiles } from "@/lib/data/profiles";
import { ActionCard } from "@/components/feed/action-card";
import { UserCard } from "@/components/feed/user-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CATEGORY_LIST } from "@/lib/constants";
import { Suspense } from "react";
import type { ActionType, CategoryId, ProfileSummary } from "@/lib/types";

export const metadata = { title: "Explore" };

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await requireUser();
  const sp = await searchParams;
  const search = sp.search?.trim();
  const category = sp.category as CategoryId | undefined;
  const type = sp.type as ActionType | undefined;

  const [actions, people] = await Promise.all([
    getExploreData({ search, category, type }, user.id),
    search ? searchProfiles(search, user.id) : getSuggestedPeople(user.id, 6),
  ]);
  const peopleList: Array<ProfileSummary & { mutualCount?: number }> = people;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Explore</h1>
          <p className="text-sm text-muted-foreground">
            Find opportunities, people, and projects that fit you.
          </p>
        </div>
      </div>

      <form method="get" className="flex flex-wrap gap-2">
        <Input
          name="search"
          defaultValue={search || ""}
          placeholder="Search by title, tag, skill..."
          className="w-full sm:max-w-xs"
        />
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={!category ? "default" : "outline"}
            asChild
          >
            <Link href={`/explore?${new URLSearchParams({ ...(search ? { search } : {}), ...(type ? { type } : {}) }).toString()}`}>
              All categories
            </Link>
          </Button>
          {CATEGORY_LIST.map((c) => {
            const active = category === c.id;
            const qs = new URLSearchParams({
              ...(search ? { search } : {}),
              category: c.id,
              ...(type ? { type } : {}),
            });
            return (
              <Button
                key={c.id}
                size="sm"
                variant={active ? "default" : "outline"}
                asChild
              >
                <Link href={`/explore?${qs.toString()}`}>
                  {c.emoji} {c.label}
                </Link>
              </Button>
            );
          })}
        </div>
      </form>

      <Suspense fallback={null}>
        {actions.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-12 text-center">
            <p className="font-medium">No results found</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Try clearing filters or searching for a different keyword.
            </p>
            <Button variant="outline" asChild>
              <Link href="/explore">Clear filters</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {actions.map((a) => (
              <ActionCard key={a.id} action={a} />
            ))}
          </div>
        )}
      </Suspense>

      {peopleList.length > 0 && (
        <section className="space-y-3 pt-2">
          <h2 className="text-sm font-semibold tracking-tight">
            {search ? "People" : "People you may know"}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {peopleList.map((p) => (
              <UserCard
                key={p.id}
                user={p}
                following={false}
                mutualCount={p.mutualCount}
                viewerId={user.id}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

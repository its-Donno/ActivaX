import { getCurrentUser } from "@/lib/auth/session";
import { getSavedActions } from "@/lib/data/actions";
import { FeedCard } from "@/components/feed/feed-card";
import { EmptyState } from "@/components/common/empty-state";
import { Bookmark } from "lucide-react";

export const metadata = { title: "Saved" };

export default async function SavedPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const saved = await getSavedActions(user.id);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Saved</h1>
        <p className="text-sm text-muted-foreground">
          Actions you&apos;ve saved for later.
        </p>
      </div>
      <div className="space-y-4">
        {saved.map((a) => (
          <FeedCard key={a.id} action={a} viewerId={user.id} />
        ))}
        {saved.length === 0 && (
          <EmptyState
            icon={Bookmark}
            title="No saved items yet"
            description="Save actions you care about to revisit them later."
          />
        )}
      </div>
    </div>
  );
}

import { getCurrentUser } from "@/lib/auth/session";
import { getNotifications } from "@/lib/data/notifications";
import { NotificationItem } from "@/components/notifications/notification-item";
import { EmptyState } from "@/components/common/empty-state";
import { Bell } from "lucide-react";

export const metadata = { title: "Activity" };

export default async function ActivityPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const notifications = await getNotifications(user.id);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Activity</h1>
        <p className="text-sm text-muted-foreground">
          Updates from your actions and connections.
        </p>
      </div>
      <div className="space-y-2">
        {notifications.map((n) => (
          <NotificationItem key={n.id} notification={n} />
        ))}
        {notifications.length === 0 && (
          <EmptyState
            icon={Bell}
            title="No notifications yet"
            description="Join actions, comment, and follow people to see updates."
          />
        )}
      </div>
    </div>
  );
}

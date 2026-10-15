import { Brand } from "@/components/common/brand";
import { SidebarNav } from "./sidebar-nav";
import { UserAvatar } from "@/components/common/user-avatar";
import { CreateActionButton } from "@/components/create/create-action-dialog";
import { getCurrentUser } from "@/lib/auth/session";
import { getUnreadNotificationCount } from "@/lib/data/notifications";
import { getConversations } from "@/lib/data/messages";
import Link from "next/link";
import { Plus } from "lucide-react";

export async function AppSidebar() {
  const [notifCount, conversations] = await Promise.all([
    getUnreadNotificationCount((await getCurrentUser())?.id ?? ""),
    getConversations((await getCurrentUser())?.id ?? ""),
  ]);
  const messageCount = conversations.reduce((s, c) => s + c.unreadCount, 0);
  const me = await getCurrentUser();

  return (
    <aside className="hidden w-72 shrink-0 border-r bg-card/40 lg:flex lg:flex-col">
      <div className="flex h-16 items-center gap-2.5 px-5">
        <Brand />
      </div>
      <div className="flex-1 overflow-auto px-3">
        <SidebarNav
          notificationCount={me ? notifCount : 0}
          messageCount={me ? messageCount : 0}
        />
        <div className="mt-3 px-2">
          <CreateActionButton className="w-full justify-start">
            <Plus className="size-4" /> Create Action
          </CreateActionButton>
        </div>
      </div>
      {me && (
        <div className="border-t p-3">
          <Link
            href="/profile"
            className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted"
          >
            <UserAvatar user={{ username: me.username, displayName: me.displayName, avatarUrl: me.avatarUrl }} />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{me.displayName}</p>
              <p className="truncate text-xs text-muted-foreground">@{me.username}</p>
            </div>
          </Link>
        </div>
      )}
    </aside>
  );
}

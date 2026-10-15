import { getCurrentUser } from "@/lib/auth/session";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { RightRail } from "@/components/layout/right-rail";
import { Toaster } from "@/components/ui/sonner";
import { redirect } from "next/navigation";
import { getUnreadNotificationCount } from "@/lib/data/notifications";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  let notificationCount = 0;
  if (user) {
    notificationCount = await getUnreadNotificationCount(user.id);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader user={user} notificationCount={notificationCount} />
      <div className="mx-auto flex max-w-7xl gap-6 px-4 pb-20 sm:px-6 lg:px-8 lg:pb-0">
        <AppSidebar />
        <main className="flex-1 py-6 lg:py-8">
          <div className="mx-auto w-full max-w-2xl lg:max-w-3xl">{children}</div>
        </main>
        <RightRail />
      </div>
      <MobileNav notificationCount={notificationCount} />
      <Toaster richColors position="top-right" />
    </div>
  );
}

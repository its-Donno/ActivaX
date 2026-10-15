"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MOBILE_NAV } from "./nav-items";
import { Plus } from "lucide-react";
import { CreateActionButton } from "@/components/create/create-action-dialog";

export function MobileNav({
  notificationCount = 0,
}: {
  notificationCount?: number;
}) {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 z-50 w-full border-t bg-card/95 backdrop-blur md:hidden"
      aria-label="Mobile navigation"
    >
      <ul className="flex h-14 items-center justify-around">
        {MOBILE_NAV.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const count = item.badge === "notifications" ? notificationCount : 0;
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative inline-flex flex-col items-center gap-1 px-3 py-1 text-[11px] font-medium",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="size-5" />
                <span>{item.label}</span>
                {count > 0 && (
                  <span className="absolute top-1 right-1 size-2 rounded-full bg-primary" />
                )}
              </Link>
            </li>
          );
        })}
        <li>
          <CreateActionButton
            className="mx-2 size-10 rounded-full shadow-sm"
            aria-label="Create action"
          >
            <Plus className="size-5" />
          </CreateActionButton>
        </li>
      </ul>
      <div className="pb-1.5" />
    </nav>
  );
}

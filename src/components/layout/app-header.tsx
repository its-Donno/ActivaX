"use client";

import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Search } from "lucide-react";
import { BrandMark } from "@/components/common/brand";
import { CreateActionButton } from "@/components/create/create-action-dialog";
import type { SessionUser } from "@/lib/types";
import { initials } from "@/lib/format";
import { signOutAction } from "@/lib/actions/auth";

export function UserMenu({ user }: { user: SessionUser }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-auto items-center gap-2 px-2"
          aria-label="Open user menu"
        >
          <Avatar size="sm">
            {user.avatarUrl ? (
              <AvatarImage src={user.avatarUrl} alt={user.displayName} />
            ) : null}
            <AvatarFallback className="text-xs">
              {initials(user.displayName || user.username)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden text-sm font-medium md:inline">
            {user.displayName}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
        <DropdownMenuLabel>
          {user.displayName} · @{user.username}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/saved">Saved</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/activity">Activity</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <form action={signOutAction}>
            <button type="submit" className="flex w-full items-center gap-1.5">
              Sign out
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function HeaderSearch() {
  return (
    <form
      action="/explore"
      method="get"
      className="relative hidden w-full max-w-sm md:block"
    >
      <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        name="search"
        placeholder="Search actions, people, skills..."
        className="h-9 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none ring-foreground/10 focus-visible:ring-2"
      />
    </form>
  );
}

export function AppHeader({
  user,
  notificationCount = 0,
}: {
  user: SessionUser;
  notificationCount?: number;
}) {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 md:hidden">
          <BrandMark />
          <span className="font-semibold">Activa</span>
        </div>
        <div className="hidden md:block" />
        <div className="flex flex-1 items-center justify-end gap-2">
          <HeaderSearch />
          <Button variant="ghost" size="icon" asChild>
            <Link href="/activity" aria-label="Notifications">
              <Bell className="size-5" />
              {notificationCount > 0 && (
                <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary" />
              )}
            </Link>
          </Button>
          <CreateActionButton className="hidden md:inline-flex" />
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  );
}

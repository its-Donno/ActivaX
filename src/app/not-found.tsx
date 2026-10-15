import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Brand } from "@/components/common/brand";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <Brand />
      <div className="space-y-2">
        <p className="text-5xl font-bold tracking-tight">404</p>
        <h1 className="text-xl font-semibold">This page went looking for action</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          We couldn&apos;t find what you were looking for. It may have been moved
          or removed.
        </p>
      </div>
      <div className="flex gap-2">
        <Button asChild>
          <Link href="/home">
            <Compass className="size-4" /> Back to feed
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/explore">Explore</Link>
        </Button>
      </div>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { Brand } from "@/components/common/brand";
import Link from "next/link";

export const metadata = { title: "Welcome" };

export default function WelcomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="mx-auto flex max-w-md flex-col items-center gap-6 text-center">
        <Brand showWordmark />
        <div className="space-y-3">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Turn ideas into action.
          </h1>
          <p className="text-lg text-muted-foreground">
            Discover opportunities, offer skills, join activities, and collaborate with people who want to make things happen.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:flex-row">
          <Button size="lg" className="w-full" asChild>
            <Link href="/signup">Get Started</Link>
          </Button>
          <Button size="lg" variant="outline" className="w-full" asChild>
            <Link href="/login">Log In</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

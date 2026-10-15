"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUpAction } from "@/lib/actions/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import type { FormState } from "@/lib/validation";

const initial: FormState = { ok: false };

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signUpAction, initial);
  const showOAuth = isSupabaseConfigured();

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <p className="text-sm text-muted-foreground">
            Join Activa to start turning ideas into action.
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {showOAuth && (
            <>
              <OAuthButtons next="/onboarding" />
              <div className="flex items-center gap-3">
                <span className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">or</span>
                <span className="h-px flex-1 bg-border" />
              </div>
            </>
          )}
          <form action={formAction} className="flex flex-col gap-3">
            <div className="grid gap-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                name="fullName"
                autoComplete="name"
                required
                minLength={2}
              />
              {state.fieldErrors?.fullName && (
                <p className="text-xs text-destructive">
                  {state.fieldErrors.fullName[0]}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
              />
              {state.fieldErrors?.email && (
                <p className="text-xs text-destructive">
                  {state.fieldErrors.email[0]}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={6}
                required
              />
              {state.fieldErrors?.password && (
                <p className="text-xs text-destructive">
                  {state.fieldErrors.password[0]}
                </p>
              )}
            </div>
            {state.error && (
              <p className="text-sm text-destructive">{state.error}</p>
            )}
            <Button type="submit" disabled={pending} className="mt-2">
              {pending ? "Creating account..." : "Sign up"}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

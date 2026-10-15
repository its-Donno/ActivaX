"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPasswordAction } from "@/lib/actions/auth";
import type { FormState } from "@/lib/validation";

const initial: FormState = { ok: false };

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(forgotPasswordAction, initial);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl">Forgot password</CardTitle>
          <p className="text-sm text-muted-foreground">
            Enter your email to receive reset instructions.
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <form action={formAction} className="flex flex-col gap-3">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            {state.message && (
              <p className="text-sm text-muted-foreground">{state.message}</p>
            )}
            <Button type="submit" disabled={pending}>
              {pending ? "Sending..." : "Send reset link"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

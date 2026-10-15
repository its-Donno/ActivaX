import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { ensureUserFromOAuth } from "@/lib/auth/oauth";
import { encodeSession } from "@/lib/auth/session";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/home";

  if (code && isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase.auth.exchangeCodeForSession(code);
    const sbUser = data.user;

    if (sbUser?.email) {
      const userId = await ensureUserFromOAuth({
        id: sbUser.id,
        email: sbUser.email,
        displayName:
          (sbUser.user_metadata?.full_name as string | undefined) ??
          (sbUser.user_metadata?.name as string | undefined) ??
          null,
        avatarUrl:
          (sbUser.user_metadata?.avatar_url as string | undefined) ?? null,
      });

      const response = NextResponse.redirect(new URL(next, origin));
      response.cookies.set("activa_session", encodeSession(userId), {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
      return response;
    }
  }

  return NextResponse.redirect(new URL(next, origin));
}

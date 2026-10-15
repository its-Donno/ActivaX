import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_SECRET, isProduction } from "../env";
import { readDb } from "../store/db";
import type { SessionUser } from "../types";

const COOKIE_NAME = "activa_session";
const MAX_AGE = 60 * 60 * 24 * 30;

function sign(payload: string) {
  return createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
}

export function encodeSession(userId: string) {
  const issuedAt = Date.now().toString();
  const payload = `${userId}.${issuedAt}`;
  return `${payload}.${sign(payload)}`;
}

export function decodeSession(token: string | undefined): string | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [userId, issuedAt, signature] = parts;
  const expected = sign(`${userId}.${issuedAt}`);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return userId;
}

export async function createSession(userId: string) {
  const store = await cookies();
  store.set(COOKIE_NAME, encodeSession(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getSessionUserId(): Promise<string | null> {
  const store = await cookies();
  return decodeSession(store.get(COOKIE_NAME)?.value);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;
  const db = await readDb();
  const profile = db.profiles.find((p) => p.id === userId);
  const account = db.accounts.find((a) => a.userId === userId);
  if (!profile || !account) return null;
  return {
    id: profile.id,
    email: account.email,
    username: profile.username,
    displayName: profile.displayName,
    avatarUrl: profile.avatarUrl,
    onboarded: profile.bio.trim().length > 0 && profile.username.length > 0,
  };
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

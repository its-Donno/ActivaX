"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { mutateDb, newId, readDb } from "../store/db";
import { hashPassword, verifyPassword } from "../auth/password";
import { createSession, clearSession, requireUser } from "../auth/session";
import {
  forgotPasswordSchema,
  onboardingSchema,
  signInSchema,
  signUpSchema,
  zodToFieldErrors,
  type FormState,
} from "../validation";

function slugifyUsername(name: string, email: string) {
  const base = (name || email.split("@")[0])
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "")
    .slice(0, 20);
  return base.length >= 3 ? base : `user${Math.floor(Math.random() * 9999)}`;
}

export async function signUpAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = signUpSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: zodToFieldErrors(parsed.error) };
  }
  const { fullName, email, password } = parsed.data;

  const duplicate = await mutateDb((db) => {
    if (db.accounts.some((a) => a.email.toLowerCase() === email.toLowerCase())) {
      return true;
    }
    const userId = newId();
    let username = slugifyUsername(fullName, email);
    let suffix = 1;
    while (db.profiles.some((p) => p.username === username)) {
      username = `${slugifyUsername(fullName, email)}${suffix++}`;
    }
    const { hash, salt } = hashPassword(password);
    db.accounts.push({
      userId,
      email,
      passwordHash: hash,
      salt,
      createdAt: new Date().toISOString(),
    });
    db.profiles.push({
      id: userId,
      username,
      displayName: fullName,
      avatarUrl: null,
      bio: "",
      location: null,
      interests: [],
      skillsOffered: [],
      skillsWanted: [],
      createdAt: new Date().toISOString(),
    });
    return false;
  });

  if (duplicate) {
    return {
      ok: false,
      fieldErrors: { email: ["An account with this email already exists"] },
    };
  }

  const account = await readDb().then((db) =>
    db.accounts.find((a) => a.email.toLowerCase() === email.toLowerCase()),
  );
  if (!account) return { ok: false, error: "Something went wrong. Try again." };

  await createSession(account.userId);
  redirect("/onboarding");
}

export async function signInAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: zodToFieldErrors(parsed.error) };
  }

  const db = await readDb();
  const account = db.accounts.find(
    (a) => a.email.toLowerCase() === parsed.data.email.toLowerCase(),
  );
  if (!account || !verifyPassword(parsed.data.password, account.salt, account.passwordHash)) {
    return { ok: false, error: "Incorrect email or password" };
  }

  await createSession(account.userId);
  const profile = db.profiles.find((p) => p.id === account.userId);
  if (profile && profile.bio.trim().length === 0) {
    redirect("/onboarding");
  }
  redirect("/home");
}

export async function signOutAction() {
  await clearSession();
  redirect("/login");
}

export async function forgotPasswordAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { ok: false, fieldErrors: zodToFieldErrors(parsed.error) };
  }
  return {
    ok: true,
    message:
      "If an account exists for that email, we've sent reset instructions.",
  };
}

export async function completeOnboardingAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();

  const arrayField = (name: string) =>
    formData.getAll(name).map(String).filter(Boolean);

  const parsed = onboardingSchema.safeParse({
    displayName: formData.get("displayName"),
    username: formData.get("username"),
    bio: formData.get("bio") ?? "",
    location: formData.get("location") ?? "",
    avatarUrl: formData.get("avatarUrl") ?? "",
    interests: arrayField("interests"),
    skillsOffered: arrayField("skillsOffered"),
    skillsWanted: arrayField("skillsWanted"),
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: zodToFieldErrors(parsed.error) };
  }

  const data = parsed.data;
  const result = await mutateDb((db) => {
    const taken = db.profiles.find(
      (p) =>
        p.id !== user.id &&
        p.username.toLowerCase() === data.username.toLowerCase(),
    );
    if (taken) return { conflict: true as const };
    const profile = db.profiles.find((p) => p.id === user.id);
    if (!profile) return { conflict: false as const, missing: true as const };
    profile.displayName = data.displayName;
    profile.username = data.username;
    profile.bio = data.bio ?? "";
    profile.location = data.location || null;
    profile.avatarUrl = data.avatarUrl || null;
    profile.interests = data.interests;
    profile.skillsOffered = data.skillsOffered;
    profile.skillsWanted = data.skillsWanted;
    return { conflict: false as const };
  });

  if (result.conflict) {
    return { ok: false, fieldErrors: { username: ["That username is taken"] } };
  }

  revalidatePath("/home");
  redirect("/home");
}

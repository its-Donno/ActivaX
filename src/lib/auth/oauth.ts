import { mutateDb, newId } from "../store/db";

function slugify(input: string) {
  const base = input.toLowerCase().replace(/[^a-z0-9_]+/g, "").slice(0, 20);
  return base.length >= 3 ? base : `user${Math.floor(Math.random() * 9999)}`;
}

/**
 * Bridges a Supabase-authenticated identity into the application store and
 * returns the app-level user id used for session cookies. Existing accounts
 * (matched by email) are reused so password and OAuth logins share a profile.
 */
export async function ensureUserFromOAuth(input: {
  id: string;
  email: string;
  displayName?: string | null;
  avatarUrl?: string | null;
}): Promise<string> {
  const email = input.email.toLowerCase();
  const now = new Date().toISOString();

  return mutateDb((db) => {
    const existing = db.accounts.find((a) => a.email.toLowerCase() === email);
    if (existing) {
      const profile = db.profiles.find((p) => p.id === existing.userId);
      if (profile) {
        if (!profile.avatarUrl && input.avatarUrl) profile.avatarUrl = input.avatarUrl;
        if (input.displayName && !profile.displayName) {
          profile.displayName = input.displayName;
        }
      }
      return existing.userId;
    }

    const userId = input.id || newId();
    let username = slugify(input.displayName || email.split("@")[0]);
    let suffix = 1;
    while (db.profiles.some((p) => p.username === username)) {
      username = `${slugify(input.displayName || email.split("@")[0])}${suffix++}`;
    }

    db.accounts.push({
      userId,
      email,
      passwordHash: "",
      salt: "",
      createdAt: now,
    });
    db.profiles.push({
      id: userId,
      username,
      displayName: input.displayName || email.split("@")[0],
      avatarUrl: input.avatarUrl ?? null,
      bio: "",
      location: null,
      interests: [],
      skillsOffered: [],
      skillsWanted: [],
      createdAt: now,
    });
    return userId;
  });
}

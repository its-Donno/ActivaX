import { mutateDb, newId, readDb } from "../store/db";
import type { Profile, ProfileStats, ProfileSummary } from "../types";
import { toProfileSummary } from "./util";

export async function getProfileById(id: string): Promise<Profile | null> {
  const db = await readDb();
  return db.profiles.find((p) => p.id === id) ?? null;
}

export async function getProfileByUsername(
  username: string,
): Promise<Profile | null> {
  const db = await readDb();
  const lower = username.toLowerCase();
  return db.profiles.find((p) => p.username.toLowerCase() === lower) ?? null;
}

export async function isFollowing(followerId: string, followingId: string) {
  const db = await readDb();
  return db.follows.some(
    (f) => f.followerId === followerId && f.followingId === followingId,
  );
}

export async function toggleFollow(followerId: string, followingId: string) {
  return mutateDb((db) => {
    if (followerId === followingId) return { following: false };
    const index = db.follows.findIndex(
      (f) => f.followerId === followerId && f.followingId === followingId,
    );
    if (index >= 0) {
      db.follows.splice(index, 1);
      return { following: false };
    }
    db.follows.push({
      followerId,
      followingId,
      createdAt: new Date().toISOString(),
    });
    db.notifications.push({
      id: newId(),
      userId: followingId,
      actorId: followerId,
      type: "follow",
      actionId: null,
      message: "started following you",
      read: false,
      createdAt: new Date().toISOString(),
    });
    return { following: true };
  });
}

export async function getProfileStats(userId: string): Promise<ProfileStats> {
  const db = await readDb();
  const joined = db.participants.filter((p) => p.userId === userId);
  return {
    followerCount: db.follows.filter((f) => f.followingId === userId).length,
    followingCount: db.follows.filter((f) => f.followerId === userId).length,
    createdCount: db.actions.filter((a) => a.authorId === userId).length,
    joinedCount: joined.length,
    helpedCount: joined.filter((p) => p.role === "helper").length,
    learnedCount: joined.filter((p) => p.role === "interested").length,
  };
}

export async function getSuggestedPeople(
  viewerId: string | null,
  limit = 5,
): Promise<Array<ProfileSummary & { mutualCount: number }>> {
  const db = await readDb();
  const following = new Set(
    viewerId
      ? db.follows.filter((f) => f.followerId === viewerId).map((f) => f.followingId)
      : [],
  );
  const candidates = db.profiles.filter(
    (p) => p.id !== viewerId && !following.has(p.id),
  );

  return candidates
    .map((p) => {
      const mutualCount =
        viewerId === null
          ? 0
          : db.follows.filter(
              (f) =>
                f.followingId === p.id &&
                db.follows.some(
                  (g) => g.followerId === viewerId && g.followingId === f.followerId,
                ),
            ).length;
      return { ...toProfileSummary(p), mutualCount };
    })
    .sort((a, b) => b.mutualCount - a.mutualCount)
    .slice(0, limit);
}

export async function searchProfiles(query: string, viewerId: string | null) {
  const db = await readDb();
  const q = query.toLowerCase();
  return db.profiles
    .filter(
      (p) =>
        p.id !== viewerId &&
        (p.username.toLowerCase().includes(q) ||
          p.displayName.toLowerCase().includes(q) ||
          p.skillsOffered.some((s) => s.toLowerCase().includes(q))),
    )
    .slice(0, 6)
    .map(toProfileSummary);
}

export async function listProfiles(): Promise<Profile[]> {
  const db = await readDb();
  return db.profiles;
}

export interface UpdateProfileInput {
  userId: string;
  displayName: string;
  username: string;
  bio: string;
  location: string | null;
  avatarUrl: string | null;
  interests: string[];
  skillsOffered: string[];
  skillsWanted: string[];
}

export async function updateProfile(input: UpdateProfileInput) {
  return mutateDb((db) => {
    const profile = db.profiles.find((p) => p.id === input.userId);
    if (!profile) return null;
    const taken = db.profiles.find(
      (p) =>
        p.id !== input.userId &&
        p.username.toLowerCase() === input.username.toLowerCase(),
    );
    if (taken) return { conflict: true as const };
    profile.displayName = input.displayName;
    profile.username = input.username;
    profile.bio = input.bio;
    profile.location = input.location;
    profile.avatarUrl = input.avatarUrl;
    profile.interests = input.interests;
    profile.skillsOffered = input.skillsOffered;
    profile.skillsWanted = input.skillsWanted;
    return { profile };
  });
}

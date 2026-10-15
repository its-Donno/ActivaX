import { mutateDb, newId, readDb } from "../store/db";
import type {
  ActionType,
  ActionWithMeta,
  CategoryId,
  ParticipationRole,
} from "../types";
import { ACTION_TYPES } from "../constants";
import { buildActionWithMeta, scoreAction, toProfileSummary } from "./util";

export interface FeedFilters {
  category?: CategoryId;
  type?: ActionType;
  search?: string;
  location?: string;
  skill?: string;
  dateFrom?: string;
}

export interface FeedOptions extends FeedFilters {
  viewerId: string | null;
  tab?: "for-you" | "following";
  limit?: number;
}

export async function getFeed(options: FeedOptions): Promise<ActionWithMeta[]> {
  const db = await readDb();
  const viewer = options.viewerId
    ? db.profiles.find((p) => p.id === options.viewerId) ?? null
    : null;

  let rows = [...db.actions];

  if (options.tab === "following" && options.viewerId) {
    const following = new Set(
      db.follows
        .filter((f) => f.followerId === options.viewerId)
        .map((f) => f.followingId),
    );
    following.add(options.viewerId);
    rows = rows.filter((a) => following.has(a.authorId));
  }

  if (options.category) rows = rows.filter((a) => a.category === options.category);
  if (options.type) rows = rows.filter((a) => a.type === options.type);
  if (options.location) {
    const q = options.location.toLowerCase();
    rows = rows.filter((a) => a.location?.toLowerCase().includes(q));
  }
  if (options.skill) {
    const q = options.skill.toLowerCase();
    rows = rows.filter((a) =>
      a.skillsNeeded.some((s) => s.toLowerCase().includes(q)),
    );
  }
  if (options.dateFrom) {
    const from = new Date(options.dateFrom).getTime();
    rows = rows.filter(
      (a) => a.eventDate && new Date(a.eventDate).getTime() >= from,
    );
  }
  if (options.search) {
    const q = options.search.toLowerCase();
    rows = rows.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q)) ||
        a.category.toLowerCase().includes(q),
    );
  }

  if (options.tab === "following") {
    rows.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  } else {
    rows.sort((a, b) => scoreAction(db, b, viewer) - scoreAction(db, a, viewer));
  }

  const limited = options.limit ? rows.slice(0, options.limit) : rows;
  return limited.map((a) => buildActionWithMeta(db, a, options.viewerId));
}

export async function getAction(
  id: string,
  viewerId: string | null,
): Promise<ActionWithMeta | null> {
  const db = await readDb();
  const action = db.actions.find((a) => a.id === id);
  if (!action) return null;
  return buildActionWithMeta(db, action, viewerId);
}

export interface CreateActionInput {
  authorId: string;
  type: ActionType;
  title: string;
  description: string;
  mediaUrl: string | null;
  category: CategoryId;
  tags: string[];
  location: string | null;
  eventDate: string | null;
  skillsNeeded: string[];
  participantLimit: number | null;
}

export async function createAction(
  input: CreateActionInput,
): Promise<ActionWithMeta> {
  return mutateDb(async (db) => {
    const action = {
      id: newId(),
      authorId: input.authorId,
      type: input.type,
      title: input.title,
      description: input.description,
      mediaUrl: input.mediaUrl,
      category: input.category,
      tags: input.tags,
      location: input.location,
      eventDate: input.eventDate,
      skillsNeeded: input.skillsNeeded,
      participantLimit: input.participantLimit,
      createdAt: new Date().toISOString(),
    };
    db.actions.push(action);

    const role: ParticipationRole = ACTION_TYPES[input.type].role;
    if (input.type === "join" || input.type === "project" || input.type === "help") {
      db.participants.push({
        id: newId(),
        actionId: action.id,
        userId: input.authorId,
        role,
        createdAt: new Date().toISOString(),
      });
    }
    return buildActionWithMeta(db, action, input.authorId);
  });
}

export interface JoinResult {
  ok: boolean;
  reason?: "full" | "not-found" | "duplicate";
  role?: ParticipationRole;
}

export async function joinAction(
  actionId: string,
  userId: string,
  explicitRole?: ParticipationRole,
): Promise<JoinResult> {
  return mutateDb((db) => {
    const action = db.actions.find((a) => a.id === actionId);
    if (!action) return { ok: false, reason: "not-found" as const };

    const existing = db.participants.find(
      (p) => p.actionId === actionId && p.userId === userId,
    );
    if (existing) return { ok: false, reason: "duplicate" as const, role: existing.role };

    const count = db.participants.filter((p) => p.actionId === actionId).length;
    if (action.participantLimit !== null && count >= action.participantLimit) {
      return { ok: false, reason: "full" as const };
    }

    const role = explicitRole ?? ACTION_TYPES[action.type].role;
    db.participants.push({
      id: newId(),
      actionId,
      userId,
      role,
      createdAt: new Date().toISOString(),
    });

    if (action.authorId !== userId) {
      db.notifications.push({
        id: newId(),
        userId: action.authorId,
        actorId: userId,
        type: role === "helper" ? "help" : "join",
        actionId,
        message:
          role === "helper"
            ? `offered help on "${action.title}"`
            : `joined "${action.title}"`,
        read: false,
        createdAt: new Date().toISOString(),
      });
    }
    return { ok: true, role };
  });
}

export async function leaveAction(actionId: string, userId: string) {
  return mutateDb((db) => {
    const action = db.actions.find((a) => a.id === actionId);
    if (!action || action.authorId === userId) return { ok: false };
    const before = db.participants.length;
    db.participants = db.participants.filter(
      (p) => !(p.actionId === actionId && p.userId === userId),
    );
    return { ok: db.participants.length < before };
  });
}

export async function getParticipants(actionId: string) {
  const db = await readDb();
  return db.participants
    .filter((p) => p.actionId === actionId)
    .map((p) => {
      const user = db.profiles.find((pr) => pr.id === p.userId);
      return { ...p, profile: user ? toProfileSummary(user) : null };
    });
}

export async function getComments(actionId: string) {
  const db = await readDb();
  return db.comments
    .filter((c) => c.actionId === actionId)
    .sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    )
    .map((c) => {
      const author = db.profiles.find((p) => p.id === c.authorId);
      return {
        ...c,
        author: author
          ? toProfileSummary(author)
          : { id: c.authorId, username: "unknown", displayName: "Unknown", avatarUrl: null, bio: "" },
      };
    });
}

export async function addComment(
  actionId: string,
  authorId: string,
  body: string,
) {
  return mutateDb((db) => {
    const action = db.actions.find((a) => a.id === actionId);
    const comment = {
      id: newId(),
      actionId,
      authorId,
      body,
      createdAt: new Date().toISOString(),
    };
    db.comments.push(comment);
    if (action && action.authorId !== authorId) {
      db.notifications.push({
        id: newId(),
        userId: action.authorId,
        actorId: authorId,
        type: "comment",
        actionId,
        message: `commented on "${action.title}"`,
        read: false,
        createdAt: new Date().toISOString(),
      });
    }
    const author = db.profiles.find((p) => p.id === authorId);
    return {
      ...comment,
      author: author
        ? toProfileSummary(author)
        : { id: authorId, username: "unknown", displayName: "Unknown", avatarUrl: null, bio: "" },
    };
  });
}

export async function getActionsByAuthor(authorId: string, viewerId: string | null) {
  const db = await readDb();
  return db.actions
    .filter((a) => a.authorId === authorId)
    .sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .map((a) => buildActionWithMeta(db, a, viewerId));
}

export async function getJoinedActions(userId: string, viewerId: string | null) {
  const db = await readDb();
  const ids = new Set(
    db.participants.filter((p) => p.userId === userId).map((p) => p.actionId),
  );
  return db.actions
    .filter((a) => ids.has(a.id))
    .sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .map((a) => buildActionWithMeta(db, a, viewerId));
}

export async function getSavedActions(userId: string) {
  const db = await readDb();
  const saved = db.savedItems
    .filter((s) => s.userId === userId)
    .sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  return saved
    .map((s) => db.actions.find((a) => a.id === s.actionId))
    .filter((a): a is NonNullable<typeof a> => Boolean(a))
    .map((a) => buildActionWithMeta(db, a, userId));
}

export async function getExploreData(
  filters: FeedFilters,
  viewerId: string | null,
): Promise<ActionWithMeta[]> {
  return getFeed({ ...filters, viewerId, limit: 40 });
}

export async function getTrendingActions(viewerId: string | null, limit = 5) {
  const db = await readDb();
  return [...db.actions]
    .sort((a, b) => {
      const score = (action: (typeof db.actions)[number]) =>
        db.likes.filter((l) => l.actionId === action.id).length * 2 +
        db.participants.filter((p) => p.actionId === action.id).length * 3;
      return score(b) - score(a);
    })
    .slice(0, limit)
    .map((a) => buildActionWithMeta(db, a, viewerId));
}

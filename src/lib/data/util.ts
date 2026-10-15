import type { Database } from "../store/db";
import type {
  ActivaAction,
  ActionWithMeta,
  Profile,
  ProfileSummary,
} from "../types";

export function toProfileSummary(profile: Profile): ProfileSummary {
  return {
    id: profile.id,
    username: profile.username,
    displayName: profile.displayName,
    avatarUrl: profile.avatarUrl,
    bio: profile.bio,
  };
}

export function buildActionWithMeta(
  db: Database,
  action: ActivaAction,
  viewerId: string | null,
): ActionWithMeta {
  const author = db.profiles.find((p) => p.id === action.authorId);
  const participants = db.participants.filter((p) => p.actionId === action.id);
  const participantProfiles = participants
    .map((p) => db.profiles.find((pr) => pr.id === p.userId))
    .filter((p): p is Profile => Boolean(p))
    .map(toProfileSummary);

  return {
    ...action,
    author: author
      ? toProfileSummary(author)
      : {
          id: action.authorId,
          username: "unknown",
          displayName: "Unknown",
          avatarUrl: null,
          bio: "",
        },
    participantCount: participants.length,
    participantAvatars: participantProfiles.slice(0, 5),
    likeCount: db.likes.filter((l) => l.actionId === action.id).length,
    commentCount: db.comments.filter((c) => c.actionId === action.id).length,
    liked: viewerId
      ? db.likes.some((l) => l.actionId === action.id && l.userId === viewerId)
      : false,
    saved: viewerId
      ? db.savedItems.some(
          (s) => s.actionId === action.id && s.userId === viewerId,
        )
      : false,
    joined: viewerId
      ? participants.some((p) => p.userId === viewerId)
      : false,
  };
}

export function scoreAction(
  db: Database,
  action: ActivaAction,
  viewer: Profile | null,
) {
  const ageHours =
    (Date.now() - new Date(action.createdAt).getTime()) / 3_600_000;
  const recency = Math.max(0, 48 - ageHours) / 48;
  const likes = db.likes.filter((l) => l.actionId === action.id).length;
  const joins = db.participants.filter((p) => p.actionId === action.id).length;
  const comments = db.comments.filter((c) => c.actionId === action.id).length;
  const engagement = Math.log1p(likes + joins * 2 + comments * 1.5) / 5;

  let affinity = 0;
  if (viewer) {
    if (viewer.interests.includes(action.category)) affinity += 1.5;
    const sharedSkills = action.skillsNeeded.filter((s) =>
      viewer.skillsOffered.includes(s),
    ).length;
    affinity += sharedSkills * 1;
    if (viewer.skillsWanted.includes(action.category)) affinity += 0.25;
  }
  return recency * 2 + engagement + affinity;
}

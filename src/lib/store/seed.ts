import type {
  ActivaAction,
  ActionParticipant,
  AppNotification,
  Comment,
  Conversation,
  ConversationMember,
  Follow,
  Like,
  Message,
  Profile,
  SavedItem,
} from "../types";
import { hashPassword } from "../auth/password";
import type { AccountRecord, Database } from "./db";

const now = Date.now();
const iso = (offsetMs: number) => new Date(now - offsetMs).toISOString();
const HOUR = 3600_000;
const DAY = 24 * HOUR;

function uuid(n: number) {
  const hex = n.toString(16).padStart(12, "0");
  return `00000000-0000-4000-8000-${hex}`;
}

export const DEMO_EMAIL = "rojin@activa.app";
export const DEMO_PASSWORD = "password123";

const people: Array<{
  id: string;
  username: string;
  displayName: string;
  bio: string;
  location: string;
  interests: string[];
  skillsOffered: string[];
  skillsWanted: string[];
  avatar: string | null;
  email: string;
}> = [
  {
    id: uuid(1),
    username: "rojin",
    displayName: "Rojin Karki",
    bio: "Community organizer turning small local ideas into big weekend wins. Coffee-powered.",
    location: "Portland, OR",
    interests: ["environment", "community"],
    skillsOffered: ["Event Planning", "Public Speaking", "Mentoring"],
    skillsWanted: ["Web Development", "Photography"],
    avatar: null,
    email: DEMO_EMAIL,
  },
  {
    id: uuid(2),
    username: "abhinav",
    displayName: "Abhinav Singh",
    bio: "Full-stack developer who likes building tools for good. Happy to teach React and help out.",
    location: "Toronto, ON",
    interests: ["technology", "education"],
    skillsOffered: ["Web Development", "Data Analysis", "Mentoring"],
    skillsWanted: ["Design", "Public Speaking"],
    avatar: null,
    email: "abhinav@activa.app",
  },
];

const actions: ActivaAction[] = [
  {
    id: uuid(101),
    authorId: uuid(1),
    type: "join",
    title: "Saturday River Cleanup — bring a friend",
    description:
      "We're clearing the stretch of riverfront near Hawthorne Bridge. Gloves, bags, and snacks provided. Two hours, big impact. Family friendly and beginner friendly.",
    mediaUrl:
      "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=1200&q=70",
    category: "environment",
    tags: ["cleanup", "river", "weekend"],
    location: "Hawthorne Bridge, Portland, OR",
    eventDate: iso(-2 * DAY).replace(/T.*/, "T09:00:00.000Z"),
    skillsNeeded: [],
    participantLimit: 30,
    createdAt: iso(2 * DAY),
  },
  {
    id: uuid(102),
    authorId: uuid(2),
    type: "ask",
    title: "Need a designer to help polish our volunteer app",
    description:
      "We built a small tool to schedule volunteers but it looks rough. Looking for someone who can spend a few hours improving the UI and giving honest feedback.",
    mediaUrl: null,
    category: "technology",
    tags: ["design", "volunteering", "react"],
    location: null,
    eventDate: null,
    skillsNeeded: ["Design", "Web Development"],
    participantLimit: 2,
    createdAt: iso(6 * HOUR),
  },
  {
    id: uuid(109),
    authorId: uuid(2),
    type: "try",
    title: "Learn to host your first open-source contribution night",
    description:
      "If you've wanted to run a coding meetup but don't know where to start, I'll walk you through it. Recording included.",
    mediaUrl: null,
    category: "technology",
    tags: ["opensource", "meetup", "learning"],
    location: "Online",
    eventDate: iso(-3 * DAY).replace(/T.*/, "T19:00:00.000Z"),
    skillsNeeded: [],
    participantLimit: null,
    createdAt: iso(7 * DAY),
  },
];

const participantData: Array<[number, number, ActionParticipant["role"]]> = [
  [101, 2, "participant"],
  [102, 1, "helper"],
];

const participants: ActionParticipant[] = participantData.map(
  ([action, user, role], i) => ({
    id: uuid(200 + i),
    actionId: uuid(action),
    userId: uuid(user),
    role,
    createdAt: iso((i + 1) * HOUR),
  }),
);

const commentData: Array<[number, number, string, number]> = [
  [101, 2, "Count me in! I'll bring extra gloves.", 1.5],
  [102, 1, "Happy to help with the UI — I'll send a few ideas today.", 5],
];

const comments: Comment[] = commentData.map(
  ([action, author, body, daysAgo], i) => ({
    id: uuid(300 + i),
    actionId: uuid(action),
    authorId: uuid(author),
    body,
    createdAt: iso(daysAgo * DAY + i * 1000),
  }),
);

const likeData: Array<[number, number]> = [
  [101, 2],
  [102, 1],
  [109, 1],
];

const likes: Like[] = likeData.map(([action, user], i) => ({
  id: uuid(400 + i),
  actionId: uuid(action),
  userId: uuid(user),
  createdAt: iso((i % 20) * HOUR + HOUR),
}));

const savedData: Array<[number, number]> = [[102, 1]];

const savedItems: SavedItem[] = savedData.map(([action, user], i) => ({
  id: uuid(500 + i),
  actionId: uuid(action),
  userId: uuid(user),
  createdAt: iso(i * DAY + HOUR),
}));

const followData: Array<[number, number]> = [
  [1, 2],
  [2, 1],
];

const follows: Follow[] = followData.map(([follower, following], i) => ({
  followerId: uuid(follower),
  followingId: uuid(following),
  createdAt: iso((i + 1) * HOUR),
}));

const notificationData: Array<
  [number, number, AppNotification["type"], number, string, boolean]
> = [
  [1, 2, "follow", 0, "started following you", false],
  [1, 2, "comment", 101, "commented on your river cleanup", false],
  [1, 2, "join", 101, "joined your river cleanup", false],
];

const notifications: AppNotification[] = notificationData.map(
  ([user, actor, type, action, message, read], i) => ({
    id: uuid(600 + i),
    userId: uuid(user),
    actorId: uuid(actor),
    type,
    actionId: action ? uuid(action) : null,
    message,
    read,
    createdAt: iso((i + 1) * 2 * HOUR),
  }),
);

const conversations: Conversation[] = [
  { id: uuid(700), createdAt: iso(3 * DAY), updatedAt: iso(2 * HOUR) },
];

const conversationMembers: ConversationMember[] = [
  { conversationId: uuid(700), userId: uuid(1), lastReadAt: iso(1 * HOUR) },
  { conversationId: uuid(700), userId: uuid(2), lastReadAt: iso(1 * HOUR) },
];

const messageData: Array<[number, number, string, number]> = [
  [700, 2, "Hey Rojin! Saw your river cleanup post — count me in.", 5],
  [700, 1, "Amazing! We're hoping for a big turnout on Saturday.", 4.5],
  [700, 2, "I can also bring a foldable table for the snacks.", 4],
  [700, 1, "Perfect — I'll add you to the organizers list.", 2],
];

const messages: Message[] = messageData.map(
  ([conversation, sender, body, hoursAgo], i) => ({
    id: uuid(800 + i),
    conversationId: uuid(conversation),
    senderId: uuid(sender),
    body,
    createdAt: iso(hoursAgo * HOUR),
  }),
);

export function createSeedDatabase(): Database {
  const profiles: Profile[] = people.map((p, i) => ({
    id: p.id,
    username: p.username,
    displayName: p.displayName,
    avatarUrl: p.avatar,
    bio: p.bio,
    location: p.location,
    interests: p.interests,
    skillsOffered: p.skillsOffered,
    skillsWanted: p.skillsWanted,
    createdAt: iso((i + 20) * DAY),
  }));

  const accounts: AccountRecord[] = people.map((p) => {
    const { hash, salt } = hashPassword(
      p.email === DEMO_EMAIL ? DEMO_PASSWORD : "password123",
    );
    return {
      userId: p.id,
      email: p.email,
      passwordHash: hash,
      salt,
      createdAt: iso(20 * DAY),
    };
  });

  return {
    accounts,
    profiles,
    actions,
    participants,
    comments,
    likes,
    savedItems,
    follows,
    notifications,
    conversations,
    conversationMembers,
    messages,
  };
}

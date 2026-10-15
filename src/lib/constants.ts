import type { ActionType, CategoryId, ParticipationRole } from "./types";

export const APP_NAME = "Activa";
export const APP_TAGLINE = "Turn ideas into action.";

export interface ActionTypeConfig {
  id: ActionType;
  label: string;
  cta: string;
  verb: string;
  role: ParticipationRole;
  description: string;
  emoji: string;
}

export const ACTION_TYPES: Record<ActionType, ActionTypeConfig> = {
  ask: {
    id: "ask",
    label: "Ask",
    cta: "Offer Help",
    verb: "Helping",
    role: "helper",
    description: "Request help or a skill from the community.",
    emoji: "🙋",
  },
  try: {
    id: "try",
    label: "Try",
    cta: "Try This",
    verb: "Trying",
    role: "interested",
    description: "Invite people to try a new activity or skill.",
    emoji: "✨",
  },
  join: {
    id: "join",
    label: "Join",
    cta: "Join",
    verb: "Joined",
    role: "participant",
    description: "Organize an event or activity people can join.",
    emoji: "🎟️",
  },
  help: {
    id: "help",
    label: "Help",
    cta: "Lend a Hand",
    verb: "Helping",
    role: "helper",
    description: "Offer your skills to a cause or person in need.",
    emoji: "🤝",
  },
  share: {
    id: "share",
    label: "Share",
    cta: "Get Details",
    verb: "Interested",
    role: "interested",
    description: "Share a resource, opportunity, or idea.",
    emoji: "📣",
  },
  project: {
    id: "project",
    label: "Start a Project",
    cta: "Collaborate",
    verb: "Collaborating",
    role: "participant",
    description: "Find collaborators for a project you are building.",
    emoji: "🛠️",
  },
};

export const ACTION_TYPE_LIST = Object.values(ACTION_TYPES);

export interface CategoryConfig {
  id: CategoryId;
  label: string;
  emoji: string;
}

export const CATEGORIES: Record<CategoryId, CategoryConfig> = {
  environment: { id: "environment", label: "Environment", emoji: "🌱" },
  education: { id: "education", label: "Education", emoji: "📚" },
  technology: { id: "technology", label: "Technology", emoji: "💻" },
  community: { id: "community", label: "Community", emoji: "🏘️" },
  health: { id: "health", label: "Health", emoji: "💚" },
  arts: { id: "arts", label: "Arts", emoji: "🎨" },
};

export const CATEGORY_LIST = Object.values(CATEGORIES);

export const POPULAR_SKILLS = [
  "Design",
  "Web Development",
  "Gardening",
  "Photography",
  "Teaching",
  "Public Speaking",
  "First Aid",
  "Cooking",
  "Writing",
  "Data Analysis",
  "Music",
  "Carpentry",
  "Translation",
  "Mentoring",
];

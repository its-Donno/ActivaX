export type ActionType = "ask" | "try" | "join" | "help" | "share" | "project";

export type CategoryId =
  | "environment"
  | "education"
  | "technology"
  | "community"
  | "health"
  | "arts";

export type ParticipationRole = "participant" | "helper" | "interested";

export interface Profile {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string;
  location: string | null;
  interests: string[];
  skillsOffered: string[];
  skillsWanted: string[];
  createdAt: string;
}

export interface ProfileSummary {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string;
}

export interface ActivaAction {
  id: string;
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
  createdAt: string;
}

export interface ActionWithMeta extends ActivaAction {
  author: ProfileSummary;
  participantCount: number;
  participantAvatars: ProfileSummary[];
  likeCount: number;
  commentCount: number;
  liked: boolean;
  saved: boolean;
  joined: boolean;
}

export interface ActionParticipant {
  id: string;
  actionId: string;
  userId: string;
  role: ParticipationRole;
  createdAt: string;
}

export interface Comment {
  id: string;
  actionId: string;
  authorId: string;
  body: string;
  createdAt: string;
}

export interface CommentWithAuthor extends Comment {
  author: ProfileSummary;
}

export interface Like {
  id: string;
  actionId: string;
  userId: string;
  createdAt: string;
}

export interface SavedItem {
  id: string;
  actionId: string;
  userId: string;
  createdAt: string;
}

export interface Follow {
  followerId: string;
  followingId: string;
  createdAt: string;
}

export type NotificationType =
  | "follow"
  | "like"
  | "comment"
  | "join"
  | "help"
  | "mention"
  | "project_update";

export interface AppNotification {
  id: string;
  userId: string;
  actorId: string | null;
  type: NotificationType;
  actionId: string | null;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface NotificationWithActor extends AppNotification {
  actor: ProfileSummary | null;
  actionTitle: string | null;
}

export interface Conversation {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationMember {
  conversationId: string;
  userId: string;
  lastReadAt: string | null;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
}

export interface ConversationSummary {
  id: string;
  updatedAt: string;
  participants: ProfileSummary[];
  lastMessage: Message | null;
  unreadCount: number;
}

export interface ProfileStats {
  followerCount: number;
  followingCount: number;
  createdCount: number;
  joinedCount: number;
  helpedCount: number;
  learnedCount: number;
}

export interface SessionUser {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  onboarded: boolean;
}

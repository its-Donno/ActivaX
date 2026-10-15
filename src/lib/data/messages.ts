import { mutateDb, newId, readDb } from "../store/db";
import type {
  Conversation,
  ConversationSummary,
  Message,
  Profile,
} from "../types";
import { toProfileSummary } from "./util";

function buildSummary(
  db: Awaited<ReturnType<typeof readDb>>,
  conversation: Conversation,
  userId: string,
): ConversationSummary {
  const members = db.conversationMembers.filter(
    (m) => m.conversationId === conversation.id,
  );
  const participants = members
    .map((m) => db.profiles.find((p) => p.id === m.userId))
    .filter((p): p is Profile => Boolean(p))
    .filter((p) => p.id !== userId)
    .map(toProfileSummary);

  const messages = db.messages
    .filter((m) => m.conversationId === conversation.id)
    .sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  const lastMessage = messages.length ? messages[messages.length - 1] : null;
  const me = members.find((m) => m.userId === userId);
  const unreadCount = messages.filter(
    (m) =>
      m.senderId !== userId &&
      (!me?.lastReadAt ||
        new Date(m.createdAt).getTime() > new Date(me.lastReadAt).getTime()),
  ).length;

  return {
    id: conversation.id,
    updatedAt: conversation.updatedAt,
    participants,
    lastMessage,
    unreadCount,
  };
}

export async function getConversations(
  userId: string,
): Promise<ConversationSummary[]> {
  const db = await readDb();
  return db.conversations
    .filter((c) =>
      db.conversationMembers.some(
        (m) => m.conversationId === c.id && m.userId === userId,
      ),
    )
    .map((c) => buildSummary(db, c, userId))
    .sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
}

export async function getConversationForUser(
  conversationId: string,
  userId: string,
) {
  const db = await readDb();
  const conversation = db.conversations.find((c) => c.id === conversationId);
  if (!conversation) return null;
  const isMember = db.conversationMembers.some(
    (m) => m.conversationId === conversationId && m.userId === userId,
  );
  if (!isMember) return null;

  const messages = db.messages
    .filter((m) => m.conversationId === conversationId)
    .sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    )
    .map((m) => {
      const sender = db.profiles.find((p) => p.id === m.senderId);
      return {
        ...m,
        sender: sender
          ? toProfileSummary(sender)
          : { id: m.senderId, username: "unknown", displayName: "Unknown", avatarUrl: null, bio: "" },
      };
    });

  const members = db.conversationMembers
    .filter((m) => m.conversationId === conversationId)
    .map((m) => db.profiles.find((p) => p.id === m.userId))
    .filter((p): p is Profile => Boolean(p))
    .map(toProfileSummary);

  return {
    conversation: { id: conversation.id, updatedAt: conversation.updatedAt },
    messages,
    members,
  };
}

export async function markConversationRead(
  conversationId: string,
  userId: string,
) {
  return mutateDb((db) => {
    const member = db.conversationMembers.find(
      (m) => m.conversationId === conversationId && m.userId === userId,
    );
    if (member) member.lastReadAt = new Date().toISOString();
    return { ok: true };
  });
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  body: string,
): Promise<Message | null> {
  return mutateDb((db) => {
    const isMember = db.conversationMembers.some(
      (m) => m.conversationId === conversationId && m.userId === senderId,
    );
    if (!isMember) return null;
    const message: Message = {
      id: newId(),
      conversationId,
      senderId,
      body,
      createdAt: new Date().toISOString(),
    };
    db.messages.push(message);
    const conversation = db.conversations.find((c) => c.id === conversationId);
    if (conversation) conversation.updatedAt = message.createdAt;

    const other = db.conversationMembers.find(
      (m) => m.conversationId === conversationId && m.userId !== senderId,
    );
    if (other) {
      db.notifications.push({
        id: newId(),
        userId: other.userId,
        actorId: senderId,
        type: "mention",
        actionId: null,
        message: "sent you a message",
        read: false,
        createdAt: message.createdAt,
      });
    }
    return message;
  });
}

export async function getOrCreateConversation(
  userId: string,
  otherUserId: string,
): Promise<string> {
  return mutateDb((db) => {
    const mine = db.conversationMembers
      .filter((m) => m.userId === userId)
      .map((m) => m.conversationId);
    const existing = db.conversationMembers.find(
      (m) => mine.includes(m.conversationId) && m.userId === otherUserId,
    );
    if (existing) return existing.conversationId;

    const id = newId();
    const now = new Date().toISOString();
    db.conversations.push({ id, createdAt: now, updatedAt: now });
    db.conversationMembers.push(
      { conversationId: id, userId, lastReadAt: now },
      { conversationId: id, userId: otherUserId, lastReadAt: null },
    );
    return id;
  });
}

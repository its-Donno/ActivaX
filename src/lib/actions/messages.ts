"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "../auth/session";
import {
  getOrCreateConversation,
  markConversationRead,
  sendMessage,
} from "../data/messages";
import { messageSchema } from "../validation";

export async function sendMessageAction(conversationId: string, body: string) {
  const user = await requireUser();
  const parsed = messageSchema.safeParse({ body });
  if (!parsed.success) return { ok: false as const, error: "Message too long" };
  const message = await sendMessage(conversationId, user.id, parsed.data.body);
  if (!message) return { ok: false as const, error: "Not a participant" };
  revalidatePath(`/messages/${conversationId}`);
  revalidatePath("/messages");
  return { ok: true as const, message };
}

export async function startConversationAction(otherUserId: string) {
  const user = await requireUser();
  const conversationId = await getOrCreateConversation(user.id, otherUserId);
  revalidatePath("/messages");
  return conversationId;
}

export async function markConversationReadAction(conversationId: string) {
  const user = await requireUser();
  await markConversationRead(conversationId, user.id);
  revalidatePath("/messages");
  return { ok: true as const };
}

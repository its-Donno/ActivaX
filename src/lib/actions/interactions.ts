"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "../auth/session";
import { toggleLike, toggleSave } from "../data/interactions";
import { toggleFollow } from "../data/profiles";

export async function toggleLikeAction(actionId: string) {
  const user = await requireUser();
  const result = await toggleLike(actionId, user.id);
  revalidatePath("/home");
  revalidatePath(`/actions/${actionId}`);
  return result;
}

export async function toggleSaveAction(actionId: string) {
  const user = await requireUser();
  const result = await toggleSave(actionId, user.id);
  revalidatePath("/saved");
  revalidatePath(`/actions/${actionId}`);
  revalidatePath("/home");
  return result;
}

export async function toggleFollowAction(userId: string, username?: string) {
  const user = await requireUser();
  const result = await toggleFollow(user.id, userId);
  revalidatePath("/home");
  revalidatePath("/explore");
  revalidatePath("/profile");
  if (username) revalidatePath(`/u/${username}`);
  return result;
}

"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "../auth/session";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "../data/notifications";

export async function markNotificationReadAction(id: string) {
  const user = await requireUser();
  const result = await markNotificationRead(id, user.id);
  revalidatePath("/activity");
  return result;
}

export async function markAllNotificationsReadAction() {
  const user = await requireUser();
  const result = await markAllNotificationsRead(user.id);
  revalidatePath("/activity");
  return result;
}

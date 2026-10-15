import { mutateDb, readDb } from "../store/db";
import type { NotificationWithActor } from "../types";
import { toProfileSummary } from "./util";

export async function getNotifications(
  userId: string,
): Promise<NotificationWithActor[]> {
  const db = await readDb();
  return db.notifications
    .filter((n) => n.userId === userId)
    .sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .map((n) => {
      const actor = n.actorId
        ? db.profiles.find((p) => p.id === n.actorId)
        : null;
      const action = n.actionId
        ? db.actions.find((a) => a.id === n.actionId)
        : null;
      return {
        ...n,
        actor: actor ? toProfileSummary(actor) : null,
        actionTitle: action?.title ?? null,
      };
    });
}

export async function getUnreadNotificationCount(userId: string) {
  const db = await readDb();
  return db.notifications.filter((n) => n.userId === userId && !n.read).length;
}

export async function markNotificationRead(id: string, userId: string) {
  return mutateDb((db) => {
    const n = db.notifications.find((x) => x.id === id && x.userId === userId);
    if (n) n.read = true;
    return { ok: Boolean(n) };
  });
}

export async function markAllNotificationsRead(userId: string) {
  return mutateDb((db) => {
    db.notifications
      .filter((n) => n.userId === userId)
      .forEach((n) => {
        n.read = true;
      });
    return { ok: true };
  });
}

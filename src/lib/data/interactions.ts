import { mutateDb, newId, readDb } from "../store/db";

export async function toggleLike(actionId: string, userId: string) {
  return mutateDb((db) => {
    const index = db.likes.findIndex(
      (l) => l.actionId === actionId && l.userId === userId,
    );
    if (index >= 0) {
      db.likes.splice(index, 1);
      return { liked: false };
    }
    db.likes.push({
      id: newId(),
      actionId,
      userId,
      createdAt: new Date().toISOString(),
    });
    const action = db.actions.find((a) => a.id === actionId);
    if (action && action.authorId !== userId) {
      db.notifications.push({
        id: newId(),
        userId: action.authorId,
        actorId: userId,
        type: "like",
        actionId,
        message: `liked "${action.title}"`,
        read: false,
        createdAt: new Date().toISOString(),
      });
    }
    return { liked: true };
  });
}

export async function toggleSave(actionId: string, userId: string) {
  return mutateDb((db) => {
    const index = db.savedItems.findIndex(
      (s) => s.actionId === actionId && s.userId === userId,
    );
    if (index >= 0) {
      db.savedItems.splice(index, 1);
      return { saved: false };
    }
    db.savedItems.push({
      id: newId(),
      actionId,
      userId,
      createdAt: new Date().toISOString(),
    });
    return { saved: true };
  });
}

export async function getInteractionState(actionId: string, userId: string) {
  const db = await readDb();
  return {
    liked: db.likes.some((l) => l.actionId === actionId && l.userId === userId),
    saved: db.savedItems.some(
      (s) => s.actionId === actionId && s.userId === userId,
    ),
  };
}

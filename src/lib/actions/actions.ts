"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "../auth/session";
import {
  addComment,
  createAction,
  joinAction,
  leaveAction,
} from "../data/actions";
import {
  commentSchema,
  createActionSchema,
  zodToFieldErrors,
  type FormState,
} from "../validation";

function parseList(value: FormDataEntryValue | null): string[] {
  if (!value) return [];
  return String(value)
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

export async function createActionAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();

  const limitRaw = formData.get("participantLimit");
  const limit =
    limitRaw && String(limitRaw).trim() !== ""
      ? Number(limitRaw)
      : null;

  const eventRaw = formData.get("eventDate");
  const eventDate =
    eventRaw && String(eventRaw).trim() !== ""
      ? new Date(String(eventRaw)).toISOString()
      : null;

  const parsed = createActionSchema.safeParse({
    type: formData.get("type"),
    title: formData.get("title"),
    description: formData.get("description"),
    category: formData.get("category"),
    mediaUrl: formData.get("mediaUrl")?.toString() || undefined,
    location: formData.get("location")?.toString() || undefined,
    eventDate: eventRaw?.toString() || undefined,
    tags: parseList(formData.get("tags")),
    skillsNeeded: parseList(formData.get("skillsNeeded")),
    participantLimit: limit,
  });

  if (!parsed.success) {
    return { ok: false, fieldErrors: zodToFieldErrors(parsed.error) };
  }

  const data = parsed.data;
  const action = await createAction({
    authorId: user.id,
    type: data.type,
    title: data.title,
    description: data.description,
    mediaUrl: data.mediaUrl || null,
    category: data.category,
    tags: data.tags,
    location: data.location || null,
    eventDate,
    skillsNeeded: data.skillsNeeded,
    participantLimit: data.participantLimit ?? null,
  });

  revalidatePath("/home");
  revalidatePath("/explore");
  revalidatePath("/profile");
  return { ok: true, message: action.id };
}

export async function joinActionAction(
  actionId: string,
  role?: "participant" | "helper" | "interested",
) {
  const user = await requireUser();
  const result = await joinAction(actionId, user.id, role);
  revalidatePath(`/actions/${actionId}`);
  revalidatePath("/home");
  revalidatePath("/profile");
  return result;
}

export async function leaveActionAction(actionId: string) {
  const user = await requireUser();
  const result = await leaveAction(actionId, user.id);
  revalidatePath(`/actions/${actionId}`);
  revalidatePath("/home");
  revalidatePath("/profile");
  return result;
}

export async function addCommentAction(actionId: string, body: string) {
  const user = await requireUser();
  const parsed = commentSchema.safeParse({ body });
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message };
  }
  const comment = await addComment(actionId, user.id, parsed.data.body);
  revalidatePath(`/actions/${actionId}`);
  return { ok: true as const, comment };
}

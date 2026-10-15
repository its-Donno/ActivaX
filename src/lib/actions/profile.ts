"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "../auth/session";
import { updateProfile } from "../data/profiles";
import { profileSchema, zodToFieldErrors, type FormState } from "../validation";

export async function updateProfileAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();

  const arrayField = (name: string) =>
    formData.getAll(name).map(String).filter(Boolean);

  const parsed = profileSchema.safeParse({
    displayName: formData.get("displayName"),
    username: formData.get("username"),
    bio: formData.get("bio") ?? "",
    location: formData.get("location") ?? "",
    avatarUrl: formData.get("avatarUrl") ?? "",
    interests: arrayField("interests"),
    skillsOffered: arrayField("skillsOffered"),
    skillsWanted: arrayField("skillsWanted"),
  });

  if (!parsed.success) {
    return { ok: false, fieldErrors: zodToFieldErrors(parsed.error) };
  }

  const result = await updateProfile({
    userId: user.id,
    displayName: parsed.data.displayName,
    username: parsed.data.username,
    bio: parsed.data.bio ?? "",
    location: parsed.data.location || null,
    avatarUrl: parsed.data.avatarUrl || null,
    interests: parsed.data.interests,
    skillsOffered: parsed.data.skillsOffered,
    skillsWanted: parsed.data.skillsWanted,
  });

  if (result && "conflict" in result) {
    return { ok: false, fieldErrors: { username: ["That username is taken"] } };
  }

  revalidatePath("/profile");
  revalidatePath(`/u/${parsed.data.username}`);
  revalidatePath("/home");
  return { ok: true, message: "Profile updated." };
}

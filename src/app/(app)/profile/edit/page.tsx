import { requireUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { getProfileById } from "@/lib/data/profiles";
import { EditProfileForm } from "@/components/profile/edit-profile-form";

export default async function EditProfilePage() {
  const user = await requireUser();
  const profile = await getProfileById(user.id);
  if (!profile) redirect("/home");
  return <EditProfileForm profile={profile} />;
}

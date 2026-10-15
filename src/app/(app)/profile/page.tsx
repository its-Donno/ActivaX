import { requireUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function MyProfilePage() {
  const user = await requireUser();
  redirect(`/u/${user.username}`);
}

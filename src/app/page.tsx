import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function RootRedirect() {
  const user = await getCurrentUser();
  if (user) redirect("/home");
  redirect("/welcome");
}

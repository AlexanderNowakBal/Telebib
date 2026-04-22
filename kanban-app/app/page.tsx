import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";

/** Root page: redirect to workspace list or sign-in */
export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  redirect("/workspaces");
}

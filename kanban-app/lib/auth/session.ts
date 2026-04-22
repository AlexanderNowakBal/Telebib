import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types/domain";

/**
 * Get the currently authenticated user + profile.
 * Returns null if no session exists.
 */
export async function getCurrentUser(): Promise<{
  id: string;
  email: string;
  profile: Profile | null;
} | null> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return {
    id: user.id,
    email: user.email ?? "",
    profile: profile
      ? {
          id: profile.id,
          displayName: profile.display_name,
          avatarUrl: profile.avatar_url,
          locale: profile.locale,
          createdAt: profile.created_at,
          updatedAt: profile.updated_at,
        }
      : null,
  };
}

/**
 * Get the user's role in a specific workspace.
 * Returns null if not a member.
 */
export async function getWorkspaceRole(
  userId: string,
  workspaceId: string,
): Promise<string | null> {
  const supabase = await createSupabaseServerClient();

  const { data } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("user_id", userId)
    .eq("workspace_id", workspaceId)
    .single();

  return data?.role ?? null;
}

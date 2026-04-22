import { notFound } from "next/navigation";
import { getCurrentUser, getWorkspaceRole } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { KanbanBoardClient } from "@/components/board/kanban-board-client";
import type { BoardSnapshot } from "@/lib/types/domain";

type PageProps = {
  params: Promise<{ workspaceSlug: string; boardSlug: string }>;
};

export default async function BoardPage({ params }: PageProps) {
  const { workspaceSlug, boardSlug } = await params;
  const user = await getCurrentUser();
  if (!user) notFound();

  const supabase = await createSupabaseServerClient();

  // Resolve workspace
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id")
    .eq("slug", workspaceSlug)
    .single();
  if (!workspace) notFound();

  const role = await getWorkspaceRole(user.id, workspace.id);
  if (!role) notFound();

  // Resolve board by name slug (boardSlug is the board id in this simplified routing)
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/boards/${boardSlug}`,
    { cache: "no-store" },
  );
  if (!res.ok) notFound();

  const { data: snapshot }: { data: BoardSnapshot } = await res.json();

  return (
    <KanbanBoardClient
      initialSnapshot={snapshot}
      userRole={role}
      userId={user.id}
    />
  );
}

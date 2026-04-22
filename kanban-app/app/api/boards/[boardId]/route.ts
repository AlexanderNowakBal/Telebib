import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { UpdateBoardSchema } from "@/lib/validation/schemas";
import { getCurrentUser, getWorkspaceRole } from "@/lib/auth/session";
import { ok, err, generateRequestId } from "@/lib/types/api";
import { canManageBoard } from "@/lib/permissions";
import type { BoardSnapshot } from "@/lib/types/domain";

// GET /api/boards/:boardId — full snapshot
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ boardId: string }> },
) {
  const requestId = generateRequestId();
  const { boardId } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json(err("UNAUTHENTICATED", "Non authentifié.", requestId), { status: 401 });

  const supabase = await createSupabaseServerClient();

  const { data: board, error: boardError } = await supabase
    .from("boards")
    .select("*")
    .eq("id", boardId)
    .single();

  if (boardError || !board) return NextResponse.json(err("NOT_FOUND", "Board introuvable.", requestId), { status: 404 });

  const role = await getWorkspaceRole(user.id, board.workspace_id);
  if (!role) return NextResponse.json(err("FORBIDDEN", "Accès refusé.", requestId), { status: 403 });

  const [{ data: columns }, { data: cards }, { data: labels }, { data: members }] = await Promise.all([
    supabase.from("columns").select("*").eq("board_id", boardId).order("position"),
    supabase.from("cards").select("*, labels:card_labels(label:labels(*)), assignee:profiles!cards_assignee_id_fkey(id,display_name,avatar_url)").eq("board_id", boardId).is("archived_at", null).order("position"),
    supabase.from("labels").select("*").eq("board_id", boardId),
    supabase.from("workspace_members").select("*, profile:profiles(id,display_name,avatar_url)").eq("workspace_id", board.workspace_id),
  ]);

  const snapshot: BoardSnapshot = {
    board: {
      id: board.id,
      workspaceId: board.workspace_id,
      name: board.name,
      description: board.description,
      archived: board.archived,
      createdAt: board.created_at,
      updatedAt: board.updated_at,
    },
    columns: (columns ?? []).map((c) => ({
      id: c.id,
      boardId: c.board_id,
      name: c.name,
      position: c.position,
      isDoneColumn: c.is_done_column,
      wipLimit: c.wip_limit,
      version: c.version,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
    })),
    cards: (cards ?? []).map((c: any) => ({
      id: c.id,
      boardId: c.board_id,
      columnId: c.column_id,
      title: c.title,
      description: c.description,
      assigneeId: c.assignee_id,
      priority: c.priority,
      dueDate: c.due_date,
      position: c.position,
      version: c.version,
      archivedAt: c.archived_at,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
      labels: (c.labels ?? []).map((cl: any) => cl.label).filter(Boolean),
      assignee: c.assignee ?? null,
    })),
    labels: (labels ?? []).map((l) => ({ id: l.id, boardId: l.board_id, name: l.name, colorToken: l.color_token })),
    members: (members ?? []).map((m: any) => ({
      workspaceId: m.workspace_id,
      userId: m.user_id,
      role: m.role,
      joinedAt: m.joined_at,
      profile: m.profile,
    })),
  };

  return NextResponse.json(ok(snapshot, requestId));
}

// PATCH /api/boards/:boardId
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ boardId: string }> },
) {
  const requestId = generateRequestId();
  const { boardId } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json(err("UNAUTHENTICATED", "Non authentifié.", requestId), { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = UpdateBoardSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(err("VALIDATION_ERROR", "Données invalides.", requestId, parsed.error.flatten().fieldErrors as Record<string, string[]>), { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data: board } = await supabase.from("boards").select("workspace_id").eq("id", boardId).single();
  if (!board) return NextResponse.json(err("NOT_FOUND", "Board introuvable.", requestId), { status: 404 });

  const role = await getWorkspaceRole(user.id, board.workspace_id);
  if (!role || !canManageBoard(role as "owner" | "admin" | "member" | "viewer")) {
    return NextResponse.json(err("FORBIDDEN", "Accès refusé.", requestId), { status: 403 });
  }

  const { data: updated, error } = await supabase
    .from("boards")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", boardId)
    .select()
    .single();

  if (error || !updated) return NextResponse.json(err("INTERNAL_ERROR", error?.message ?? "Erreur", requestId), { status: 500 });

  return NextResponse.json(ok(updated, requestId));
}

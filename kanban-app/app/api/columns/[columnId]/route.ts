import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { UpdateColumnSchema } from "@/lib/validation/schemas";
import { getCurrentUser, getWorkspaceRole } from "@/lib/auth/session";
import { ok, err, generateRequestId } from "@/lib/types/api";
import { canManageColumns } from "@/lib/permissions";

// PATCH /api/columns/:columnId
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ columnId: string }> },
) {
  const requestId = generateRequestId();
  const { columnId } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json(err("UNAUTHENTICATED", "Non authentifié.", requestId), { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = UpdateColumnSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      err("VALIDATION_ERROR", "Données invalides.", requestId, parsed.error.flatten().fieldErrors as Record<string, string[]>),
      { status: 400 },
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data: col } = await supabase
    .from("columns")
    .select("version, board_id, boards!columns_board_id_fkey(workspace_id)")
    .eq("id", columnId)
    .single() as { data: { version: number; board_id: string; boards: { workspace_id: string } | null } | null };

  if (!col) return NextResponse.json(err("NOT_FOUND", "Colonne introuvable.", requestId), { status: 404 });

  if (col.version !== parsed.data.expectedVersion) {
    return NextResponse.json(
      err("CONFLICT", "La colonne a été modifiée par un autre utilisateur.", requestId, { expectedVersion: ["Version obsolète."] }),
      { status: 409 },
    );
  }

  const workspaceId = col.boards?.workspace_id;
  if (!workspaceId) return NextResponse.json(err("NOT_FOUND", "Board introuvable.", requestId), { status: 404 });

  const role = await getWorkspaceRole(user.id, workspaceId);
  if (!role || !canManageColumns(role as "owner" | "admin" | "member" | "viewer")) {
    return NextResponse.json(err("FORBIDDEN", "Accès refusé.", requestId), { status: 403 });
  }

  const { expectedVersion: _ev, ...rest } = parsed.data;

  const { data: updated, error } = await supabase
    .from("columns")
    .update({ ...rest, version: col.version + 1, updated_at: new Date().toISOString() })
    .eq("id", columnId)
    .select()
    .single();

  if (error || !updated) return NextResponse.json(err("INTERNAL_ERROR", error?.message ?? "Erreur", requestId), { status: 500 });

  return NextResponse.json(ok(updated, requestId));
}

// DELETE /api/columns/:columnId — only if no active cards
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ columnId: string }> },
) {
  const requestId = generateRequestId();
  const { columnId } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json(err("UNAUTHENTICATED", "Non authentifié.", requestId), { status: 401 });

  const supabase = await createSupabaseServerClient();
  const { data: col } = await supabase
    .from("columns")
    .select("board_id, boards!columns_board_id_fkey(workspace_id)")
    .eq("id", columnId)
    .single() as { data: { board_id: string; boards: { workspace_id: string } | null } | null };

  if (!col) return NextResponse.json(err("NOT_FOUND", "Colonne introuvable.", requestId), { status: 404 });

  const workspaceId = col.boards?.workspace_id;
  if (!workspaceId) return NextResponse.json(err("NOT_FOUND", "Board introuvable.", requestId), { status: 404 });

  const role = await getWorkspaceRole(user.id, workspaceId);
  if (!role || !canManageColumns(role as "owner" | "admin" | "member" | "viewer")) {
    return NextResponse.json(err("FORBIDDEN", "Accès refusé.", requestId), { status: 403 });
  }

  const { count } = await supabase
    .from("cards")
    .select("*", { count: "exact", head: true })
    .eq("column_id", columnId)
    .is("archived_at", null);

  if ((count ?? 0) > 0) {
    return NextResponse.json(
      err("CONFLICT", "La colonne contient des cartes actives.", requestId),
      { status: 409 },
    );
  }

  await supabase.from("columns").delete().eq("id", columnId);
  return NextResponse.json(ok({ deleted: true }, requestId));
}

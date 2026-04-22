import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CreateColumnSchema } from "@/lib/validation/schemas";
import { getCurrentUser, getWorkspaceRole } from "@/lib/auth/session";
import { ok, err, generateRequestId } from "@/lib/types/api";
import { canManageColumns } from "@/lib/permissions";

// POST /api/columns
export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  const user = await getCurrentUser();
  if (!user) return NextResponse.json(err("UNAUTHENTICATED", "Non authentifié.", requestId), { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = CreateColumnSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      err("VALIDATION_ERROR", "Données invalides.", requestId, parsed.error.flatten().fieldErrors as Record<string, string[]>),
      { status: 400 },
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data: board } = await supabase.from("boards").select("workspace_id").eq("id", parsed.data.boardId).single();
  if (!board) return NextResponse.json(err("NOT_FOUND", "Board introuvable.", requestId), { status: 404 });

  const role = await getWorkspaceRole(user.id, board.workspace_id);
  if (!role || !canManageColumns(role as "owner" | "admin" | "member" | "viewer")) {
    return NextResponse.json(err("FORBIDDEN", "Accès refusé.", requestId), { status: 403 });
  }

  // Position at end if not specified
  let position = parsed.data.position;
  if (position === undefined) {
    const { data: last } = await supabase
      .from("columns")
      .select("position")
      .eq("board_id", parsed.data.boardId)
      .order("position", { ascending: false })
      .limit(1)
      .single();
    position = (last?.position ?? 0) + 1024;
  }

  const { data: column, error } = await supabase
    .from("columns")
    .insert({ board_id: parsed.data.boardId, name: parsed.data.name, position, version: 1 })
    .select()
    .single();

  if (error || !column) return NextResponse.json(err("INTERNAL_ERROR", error?.message ?? "Erreur", requestId), { status: 500 });

  return NextResponse.json(ok(column, requestId), { status: 201 });
}

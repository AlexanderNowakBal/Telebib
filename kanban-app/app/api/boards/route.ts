import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CreateBoardSchema, UpdateBoardSchema } from "@/lib/validation/schemas";
import { getCurrentUser, getWorkspaceRole } from "@/lib/auth/session";
import { ok, err, generateRequestId } from "@/lib/types/api";
import { canManageBoard } from "@/lib/permissions";

const BASIC_TEMPLATE_COLUMNS = [
  { name: "À faire", position: 1024, is_done_column: false },
  { name: "En cours", position: 2048, is_done_column: false },
  { name: "Fait", position: 3072, is_done_column: true },
];

// GET /api/boards?workspaceId=:id
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  const user = await getCurrentUser();
  if (!user) return NextResponse.json(err("UNAUTHENTICATED", "Non authentifié.", requestId), { status: 401 });

  const workspaceId = request.nextUrl.searchParams.get("workspaceId");
  if (!workspaceId) return NextResponse.json(err("VALIDATION_ERROR", "workspaceId requis.", requestId), { status: 400 });

  const role = await getWorkspaceRole(user.id, workspaceId);
  if (!role) return NextResponse.json(err("FORBIDDEN", "Accès refusé.", requestId), { status: 403 });

  const supabase = await createSupabaseServerClient();
  const { data: boards, error } = await supabase
    .from("boards")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("archived", false)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json(err("INTERNAL_ERROR", error.message, requestId), { status: 500 });

  return NextResponse.json(ok(boards, requestId));
}

// POST /api/boards
export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  const user = await getCurrentUser();
  if (!user) return NextResponse.json(err("UNAUTHENTICATED", "Non authentifié.", requestId), { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = CreateBoardSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      err("VALIDATION_ERROR", "Données invalides.", requestId, parsed.error.flatten().fieldErrors as Record<string, string[]>),
      { status: 400 },
    );
  }

  const role = await getWorkspaceRole(user.id, parsed.data.workspaceId);
  if (!role || !canManageBoard(role as "owner" | "admin" | "member" | "viewer")) {
    return NextResponse.json(err("FORBIDDEN", "Seuls les admins peuvent créer un board.", requestId), { status: 403 });
  }

  const supabase = await createSupabaseServerClient();
  const { data: board, error } = await supabase
    .from("boards")
    .insert({ workspace_id: parsed.data.workspaceId, name: parsed.data.name, description: "" })
    .select()
    .single();

  if (error || !board) return NextResponse.json(err("INTERNAL_ERROR", error?.message ?? "Erreur", requestId), { status: 500 });

  // Create default columns if using the "basic" template
  if (parsed.data.template === "basic") {
    await supabase.from("columns").insert(
      BASIC_TEMPLATE_COLUMNS.map((col) => ({ ...col, board_id: board.id, version: 1 })),
    );
  }

  return NextResponse.json(ok(board, requestId), { status: 201 });
}

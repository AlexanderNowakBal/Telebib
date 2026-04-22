import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CreateCardSchema, UpdateCardSchema } from "@/lib/validation/schemas";
import { getCurrentUser, getWorkspaceRole } from "@/lib/auth/session";
import { ok, err, generateRequestId } from "@/lib/types/api";
import { canEditCard } from "@/lib/permissions";

// POST /api/cards — create a card
export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  const user = await getCurrentUser();
  if (!user) return NextResponse.json(err("UNAUTHENTICATED", "Non authentifié.", requestId), { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = CreateCardSchema.safeParse(body);
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
  if (!role || !canEditCard(role as "owner" | "admin" | "member" | "viewer")) {
    return NextResponse.json(err("FORBIDDEN", "Accès refusé.", requestId), { status: 403 });
  }

  // Determine position at end of column
  const { data: lastCard } = await supabase
    .from("cards")
    .select("position")
    .eq("column_id", parsed.data.columnId)
    .is("archived_at", null)
    .order("position", { ascending: false })
    .limit(1)
    .single();

  const position = (lastCard?.position ?? 0) + 1024;

  const { data: card, error } = await supabase
    .from("cards")
    .insert({
      board_id: parsed.data.boardId,
      column_id: parsed.data.columnId,
      title: parsed.data.title,
      description: parsed.data.description,
      assignee_id: parsed.data.assigneeId,
      priority: parsed.data.priority,
      due_date: parsed.data.dueDate,
      position,
      version: 1,
    })
    .select()
    .single();

  if (error || !card) return NextResponse.json(err("INTERNAL_ERROR", error?.message ?? "Erreur", requestId), { status: 500 });

  // Attach labels
  if (parsed.data.labelIds.length > 0) {
    await supabase.from("card_labels").insert(
      parsed.data.labelIds.map((labelId) => ({ card_id: card.id, label_id: labelId })),
    );
  }

  return NextResponse.json(ok(card, requestId), { status: 201 });
}

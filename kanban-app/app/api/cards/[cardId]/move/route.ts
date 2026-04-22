import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { MoveCardSchema } from "@/lib/validation/schemas";
import { getCurrentUser, getWorkspaceRole } from "@/lib/auth/session";
import { ok, err, generateRequestId } from "@/lib/types/api";
import { canEditCard } from "@/lib/permissions";

// POST /api/cards/:cardId/move
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ cardId: string }> },
) {
  const requestId = generateRequestId();
  const { cardId } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json(err("UNAUTHENTICATED", "Non authentifié.", requestId), { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = MoveCardSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      err("VALIDATION_ERROR", "Données invalides.", requestId, parsed.error.flatten().fieldErrors as Record<string, string[]>),
      { status: 400 },
    );
  }

  const supabase = await createSupabaseServerClient();

  // Load the card and its board
  const { data: card } = await supabase
    .from("cards")
    .select("id, version, column_id, board_id, boards!cards_board_id_fkey(workspace_id)")
    .eq("id", cardId)
    .single() as { data: { id: string; version: number; column_id: string; board_id: string; boards: { workspace_id: string } | null } | null };

  if (!card) return NextResponse.json(err("NOT_FOUND", "Carte introuvable.", requestId), { status: 404 });

  if (card.version !== parsed.data.expectedVersion) {
    return NextResponse.json(
      err("CONFLICT", "La carte a été modifiée par un autre utilisateur.", requestId, {
        expectedVersion: ["Version obsolète."],
      }),
      { status: 409 },
    );
  }

  const workspaceId = card.boards?.workspace_id;
  if (!workspaceId) return NextResponse.json(err("NOT_FOUND", "Board introuvable.", requestId), { status: 404 });

  const role = await getWorkspaceRole(user.id, workspaceId);
  if (!role || !canEditCard(role as "owner" | "admin" | "member" | "viewer")) {
    return NextResponse.json(err("FORBIDDEN", "Accès refusé.", requestId), { status: 403 });
  }

  // Get all active cards in the target column to compute new position
  const { data: targetCards } = await supabase
    .from("cards")
    .select("id, position")
    .eq("column_id", parsed.data.toColumnId)
    .is("archived_at", null)
    .order("position");

  const targetList = (targetCards ?? []).filter((c) => c.id !== cardId);
  const toIndex = Math.min(parsed.data.toIndex, targetList.length);

  const prevPos = targetList[toIndex - 1]?.position ?? 0;
  const nextPos = targetList[toIndex]?.position ?? prevPos + 2048;
  const newPosition = Math.floor((prevPos + nextPos) / 2);

  const { data: updated, error } = await supabase
    .from("cards")
    .update({
      column_id: parsed.data.toColumnId,
      position: newPosition,
      version: card.version + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", cardId)
    .select()
    .single();

  if (error || !updated) return NextResponse.json(err("INTERNAL_ERROR", error?.message ?? "Erreur", requestId), { status: 500 });

  return NextResponse.json(
    ok(
      {
        cardId,
        fromColumnId: card.column_id,
        toColumnId: parsed.data.toColumnId,
        position: newPosition,
        version: card.version + 1,
        updatedAt: updated.updated_at,
      },
      requestId,
    ),
  );
}

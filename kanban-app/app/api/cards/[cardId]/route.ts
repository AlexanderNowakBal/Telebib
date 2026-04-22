import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { UpdateCardSchema } from "@/lib/validation/schemas";
import { getCurrentUser, getWorkspaceRole } from "@/lib/auth/session";
import { ok, err, generateRequestId } from "@/lib/types/api";
import { canEditCard } from "@/lib/permissions";

// PATCH /api/cards/:cardId — update a card
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ cardId: string }> },
) {
  const requestId = generateRequestId();
  const { cardId } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json(err("UNAUTHENTICATED", "Non authentifié.", requestId), { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = UpdateCardSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      err("VALIDATION_ERROR", "Données invalides.", requestId, parsed.error.flatten().fieldErrors as Record<string, string[]>),
      { status: 400 },
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data: existing } = await supabase
    .from("cards")
    .select("version, board_id, boards!cards_board_id_fkey(workspace_id)")
    .eq("id", cardId)
    .single() as { data: { version: number; board_id: string; boards: { workspace_id: string } | null } | null };

  if (!existing) return NextResponse.json(err("NOT_FOUND", "Carte introuvable.", requestId), { status: 404 });

  if (existing.version !== parsed.data.expectedVersion) {
    return NextResponse.json(
      err("CONFLICT", "La carte a été modifiée par un autre utilisateur.", requestId, {
        expectedVersion: ["Version obsolète."],
      }),
      { status: 409 },
    );
  }

  const workspaceId = existing.boards?.workspace_id;
  if (!workspaceId) return NextResponse.json(err("NOT_FOUND", "Board introuvable.", requestId), { status: 404 });

  const role = await getWorkspaceRole(user.id, workspaceId);
  if (!role || !canEditCard(role as "owner" | "admin" | "member" | "viewer")) {
    return NextResponse.json(err("FORBIDDEN", "Accès refusé.", requestId), { status: 403 });
  }

  const { expectedVersion: _ev, labelIds, ...rest } = parsed.data;

  const { data: updated, error } = await supabase
    .from("cards")
    .update({ ...rest, version: existing.version + 1, updated_at: new Date().toISOString() })
    .eq("id", cardId)
    .select()
    .single();

  if (error || !updated) return NextResponse.json(err("INTERNAL_ERROR", error?.message ?? "Erreur", requestId), { status: 500 });

  // Update labels if provided
  if (labelIds !== undefined) {
    await supabase.from("card_labels").delete().eq("card_id", cardId);
    if (labelIds.length > 0) {
      await supabase.from("card_labels").insert(labelIds.map((lid) => ({ card_id: cardId, label_id: lid })));
    }
  }

  return NextResponse.json(ok(updated, requestId));
}

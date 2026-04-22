import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CreateWorkspaceSchema } from "@/lib/validation/schemas";
import { getCurrentUser } from "@/lib/auth/session";
import { ok, err, generateRequestId } from "@/lib/types/api";

// GET /api/workspaces
export async function GET() {
  const requestId = generateRequestId();
  const user = await getCurrentUser();
  if (!user) return NextResponse.json(err("UNAUTHENTICATED", "Non authentifié.", requestId), { status: 401 });

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("workspace_members")
    .select("workspace_id, role, joined_at, workspace:workspaces(id,name,slug,default_locale,created_at,updated_at)")
    .eq("user_id", user.id);

  if (error) return NextResponse.json(err("INTERNAL_ERROR", error.message, requestId), { status: 500 });

  const workspaces = (data ?? []).map((wm: any) => ({
    ...wm.workspace,
    role: wm.role,
    joinedAt: wm.joined_at,
  }));

  return NextResponse.json(ok(workspaces, requestId));
}

// POST /api/workspaces
export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  const user = await getCurrentUser();
  if (!user) return NextResponse.json(err("UNAUTHENTICATED", "Non authentifié.", requestId), { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = CreateWorkspaceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      err("VALIDATION_ERROR", "Données invalides.", requestId, parsed.error.flatten().fieldErrors as Record<string, string[]>),
      { status: 400 },
    );
  }

  const supabase = await createSupabaseServerClient();

  const { data: existing } = await supabase.from("workspaces").select("id").eq("slug", parsed.data.slug).single();
  if (existing) {
    return NextResponse.json(err("CONFLICT", "Ce slug est déjà utilisé.", requestId), { status: 409 });
  }

  const { data: workspace, error } = await supabase
    .from("workspaces")
    .insert({ name: parsed.data.name, slug: parsed.data.slug })
    .select()
    .single();

  if (error || !workspace) return NextResponse.json(err("INTERNAL_ERROR", error?.message ?? "Erreur", requestId), { status: 500 });

  // Add creator as owner
  await supabase.from("workspace_members").insert({
    workspace_id: workspace.id,
    user_id: user.id,
    role: "owner",
  });

  return NextResponse.json(ok(workspace, requestId), { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import { MagicLinkSchema } from "@/lib/validation/schemas";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ok, err, generateRequestId } from "@/lib/types/api";

// POST /api/auth/magic-link — send magic link email
export async function POST(request: NextRequest) {
  const requestId = generateRequestId();

  const body = await request.json().catch(() => null);
  const parsed = MagicLinkSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      err("VALIDATION_ERROR", "Données invalides", requestId, parsed.error.flatten().fieldErrors as Record<string, string[]>),
      { status: 400 },
    );
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) {
    return NextResponse.json(
      err("INTERNAL_ERROR", "Impossible d'envoyer le lien de connexion.", requestId),
      { status: 500 },
    );
  }

  return NextResponse.json(ok({ sent: true }, requestId), { status: 200 });
}

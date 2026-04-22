import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ok, generateRequestId } from "@/lib/types/api";

// POST /api/auth/sign-out
export async function POST() {
  const requestId = generateRequestId();
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  return NextResponse.json(ok({ signedOut: true }, requestId));
}

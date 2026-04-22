import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { ok, err, generateRequestId } from "@/lib/types/api";

// GET /api/auth/session — return the current authenticated user
export async function GET() {
  const requestId = generateRequestId();
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(err("UNAUTHENTICATED", "Aucune session active.", requestId), { status: 401 });
  }

  return NextResponse.json(ok({ user }, requestId));
}

---
mode: agent
description: Générer un Route Handler Next.js typé et sécurisé
---

Génère un Route Handler Next.js App Router dans `app/api/${input:path}/route.ts`.

## Exigences

1. Valider le body avec un schéma Zod importé depuis `lib/validation/schemas.ts`.
2. Authentifier l'utilisateur avec `getCurrentUser()` depuis `lib/auth/session.ts` — retourner `401` si non authentifié.
3. Vérifier les permissions avec les fonctions de `lib/permissions/index.ts` — retourner `403` si insuffisant.
4. Retourner les réponses avec `ok()` / `err()` depuis `lib/types/api.ts`.
5. Envelopper dans un `try/catch` — retourner `err("INTERNAL_ERROR", ...)` pour les erreurs inattendues.
6. Ajouter un commentaire JSDoc décrivant le endpoint.

## Template

```ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import { ok, err } from "@/lib/types/api";
import { XxxSchema } from "@/lib/validation/schemas";

/**
 * POST /api/${input:path}
 * Description : ${input:description}
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json(err("UNAUTHORIZED", "Non authentifié"), { status: 401 });

    const body = await req.json();
    const parsed = XxxSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(err("VALIDATION_ERROR", "Données invalides", parsed.error.flatten()), { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    // ... logique métier

    return NextResponse.json(ok(result), { status: 201 });
  } catch (e) {
    return NextResponse.json(err("INTERNAL_ERROR", "Erreur serveur"), { status: 500 });
  }
}
```

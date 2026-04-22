---
mode: agent
description: Générer des tests unitaires Vitest pour un module lib/
---

Génère des tests unitaires Vitest pour le module `${input:filePath}`.

## Exigences

1. Importer depuis `vitest` : `describe`, `it`, `expect`, `vi`.
2. Couvrir tous les cas nominaux (happy path).
3. Couvrir les cas limites (valeurs null/undefined, tableaux vides, valeurs extrêmes).
4. Couvrir les cas d'erreur (entrées invalides, permissions refusées).
5. Aucune dépendance réseau — mocker Supabase avec `vi.mock`.
6. Nommer les tests en français avec le format : `"[fonction] — [scénario]"`.

## Template

```ts
import { describe, it, expect, vi } from "vitest";
import { functionToTest } from "@/lib/module";

describe("functionToTest", () => {
  it("cas nominal — description", () => {
    const result = functionToTest(validInput);
    expect(result).toEqual(expectedOutput);
  });

  it("cas limite — description", () => {
    // ...
  });

  it("cas d'erreur — description", () => {
    // ...
  });
});
```

## Couverture minimale attendue

- Toutes les branches (if/else, switch) doivent être couvertes.
- Les fonctions de permission doivent être testées pour les 4 rôles : `owner`, `admin`, `member`, `viewer`.

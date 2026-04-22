---
mode: agent
description: Générer un composant React accessible avec Tailwind
---

Génère un composant React dans `components/${input:path}.tsx`.

## Exigences

1. Client Component (`"use client"`) uniquement si nécessaire pour l'interactivité.
2. Props typées avec une interface TypeScript exportée.
3. Accessibilité WCAG 2.2 AA :
   - Tous les éléments interactifs ont `aria-label` ou `aria-labelledby`.
   - Les états d'erreur utilisent `role="alert"`.
   - Navigation clavier complète.
4. Styles Tailwind CSS v3 — pas de `@apply`.
5. Utiliser `focus-visible:` pour les états de focus.
6. Export nommé ET export par défaut.

## Template

```tsx
"use client"; // Supprimer si Server Component

import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export interface ${input:ComponentName}Props extends ComponentPropsWithoutRef<"div"> {
  // props ici
}

export function ${input:ComponentName}({ className, ...props }: ${input:ComponentName}Props) {
  return (
    <div
      className={cn("", className)}
      {...props}
    />
  );
}

export default ${input:ComponentName};
```

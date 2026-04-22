# Instructions GitHub Copilot — Kanban Board

## Langage et style

- TypeScript strict (`strict: true`) — aucun `any` implicite.
- Nommer les variables et fonctions en anglais, les commentaires et messages UI en français (fr-BE).
- Utiliser les imports path aliases (`@/lib/...`, `@/components/...`, `@/app/...`).

## Architecture

- **Server Components** pour tout ce qui peut être rendu côté serveur.
- **Client Components** (`"use client"`) uniquement pour l'interactivité (DnD, modals, état local).
- **Route Handlers** pour les mutations — pattern `{ data, error }` via `ok()` / `err()`.
- **Zod** pour valider toutes les entrées à la frontière API.

## Base de données

- Toujours utiliser le client Supabase approprié (server vs browser).
- Les requêtes doivent respecter le schéma typé `Database` de `lib/supabase/database.types.ts`.
- Utiliser `expectedVersion` pour les mises à jour de cartes (verrouillage optimiste).

## Accessibilité (WCAG 2.2 AA)

- Chaque élément interactif doit avoir un `aria-label` ou `aria-labelledby`.
- Utiliser `role="alert"` pour les messages d'erreur.
- Le focus doit être piégé dans les modals (Radix Dialog gère cela automatiquement).
- Proposer une alternative clavier à tout drag-and-drop.

## Tailwind CSS

- Utiliser Tailwind v3 — pas de `@apply` sauf dans `globals.css`.
- Préférer les classes utilitaires directement dans le JSX.
- Utiliser `focus-visible:` plutôt que `focus:` pour les états de focus.

## Performances

- Charger les données côté serveur dans les Server Components.
- Utiliser `React.memo` ou `useMemo` avec parcimonie — d'abord mesurer.
- Le Service Worker gère le cache réseau — ne pas dupliquer la logique.

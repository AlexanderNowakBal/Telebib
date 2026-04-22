# AGENTS.md — Instructions pour GitHub Copilot Agent

Ce fichier définit les règles que l'agent Copilot doit respecter dans ce projet.

## 1. Conventions Next.js App Router

- Les Server Components sont dans `app/` et n'ont **pas** la directive `"use client"`.
- Les Client Components ont la directive `"use client"` en première ligne.
- Les Route Handlers sont dans `app/api/**` dans des fichiers `route.ts`.
- Les mutations passent par les Route Handlers — jamais de `server actions` pour l'instant.

## 2. Gestion des secrets

- Ne jamais exposer `SUPABASE_SECRET_KEY` dans du code client.
- Utiliser `createSupabaseServerClient()` dans les Server Components et Route Handlers.
- Utiliser `createSupabaseBrowserClient()` uniquement dans les Client Components.
- Ne jamais logger les tokens d'authentification.

## 3. Rôles et permissions

- Toujours vérifier les permissions via les fonctions de `lib/permissions/index.ts`.
- Les rôles sont : `owner > admin > member > viewer`.
- Les mutations destructrices (DELETE, archivage de board) nécessitent `owner` ou `admin`.
- Le `viewer` peut uniquement lire ; il ne peut pas créer, modifier ou déplacer des cartes.

## 4. Alternative au glisser-déposer

- Chaque action de déplacement doit proposer une alternative clavier.
- Le bouton "Déplacer vers…" doit ouvrir un Dialog Radix accessible.
- Ne jamais implémenter un drag-only workflow sans alternative au clavier.

## 5. Schémas de validation

- Toujours valider les entrées API avec les schémas Zod de `lib/validation/schemas.ts`.
- Utiliser `schema.safeParse()` et retourner `err("VALIDATION_ERROR", ...)` si invalide.
- L'`expectedVersion` est obligatoire pour toutes les mutations de cartes.

## 6. Tests

- Chaque nouveau module `lib/` doit avoir un test unitaire correspondant dans `tests/unit/`.
- Chaque nouveau Route Handler doit avoir un test d'intégration dans `tests/integration/`.
- Chaque nouveau flow utilisateur doit avoir un test E2E dans `tests/e2e/`.

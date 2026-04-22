# Kanban Board — README

Application Kanban collaborative multi-espaces, construite avec Next.js 15 App Router, Supabase et Tailwind CSS.

## Stack technique

| Couche | Technologie |
|---|---|
| Framework | Next.js 15 (App Router) |
| Langage | TypeScript (strict) |
| Base de données | Supabase (PostgreSQL + Realtime) |
| Authentification | Supabase Auth (Magic Link) |
| Style | Tailwind CSS v3 |
| Composants UI | Radix UI |
| Drag & Drop | dnd-kit |
| Validation | Zod |
| Offline | IndexedDB (idb) + Service Worker |
| Tests unitaires | Vitest + React Testing Library |
| Tests E2E | Playwright + axe-core |
| Package manager | pnpm |

## Démarrage rapide

### Prérequis

- Node.js ≥ 20
- pnpm ≥ 9 (`npm install -g pnpm`)
- Un projet Supabase (gratuit sur [supabase.com](https://supabase.com))

### 1. Cloner et installer

```bash
git clone <repo-url>
cd kanban-app
pnpm install
```

### 2. Configurer les variables d'environnement

```bash
cp .env.example .env.local
```

Remplir `.env.local` avec les valeurs de votre projet Supabase (disponibles dans **Project Settings → API**).

### 3. Initialiser la base de données

```bash
# Via l'interface Supabase SQL Editor, exécuter dans l'ordre :
# 1. supabase/migrations/001_initial_schema.sql
# 2. supabase/policies/rls_policies.sql
# 3. (optionnel) supabase/seed.sql
```

Ou avec la CLI Supabase :

```bash
npx supabase db push
```

### 4. Lancer l'application

```bash
pnpm dev
# http://localhost:3000
```

## Scripts disponibles

| Commande | Description |
|---|---|
| `pnpm dev` | Serveur de développement |
| `pnpm build` | Build de production |
| `pnpm start` | Démarrer en production |
| `pnpm lint` | ESLint |
| `pnpm test:unit` | Tests unitaires (Vitest) |
| `pnpm test:e2e` | Tests E2E (Playwright) |
| `pnpm tsc --noEmit` | Vérification TypeScript |

## Structure du projet

```
kanban-app/
├── app/                    # Next.js App Router
│   ├── api/                # Route Handlers (REST BFF)
│   ├── (auth)/             # Pages d'authentification
│   ├── workspaces/         # Liste et création d'espaces
│   └── w/[ws]/b/[board]/   # Vue board principale
├── components/
│   ├── board/              # Composants Kanban (colonnes, cartes, DnD)
│   └── cards/              # Modal de détail de carte
├── lib/
│   ├── auth/               # Helpers session
│   ├── offline/            # IndexedDB + outbox
│   ├── permissions/        # Fonctions de permission (pures)
│   ├── supabase/           # Clients Supabase (server + browser)
│   ├── types/              # Types domaine + API
│   ├── utils/              # Utilitaires partagés
│   └── validation/         # Schémas Zod
├── supabase/
│   ├── migrations/         # Schema SQL
│   └── policies/           # Politiques RLS
├── tests/
│   ├── unit/               # Tests Vitest
│   ├── integration/        # Tests Route Handlers
│   ├── e2e/                # Tests Playwright
│   └── accessibility/      # Tests axe-core
└── public/
    └── sw.js               # Service Worker
```

## Accessibilité

L'application respecte les critères **WCAG 2.2 AA** :
- Navigation complète au clavier
- Alternative au glisser-déposer ("Déplacer vers…")
- Focus trap dans les modals
- Annonces `aria-live` pour les mises à jour temps réel
- Respect de `prefers-reduced-motion`

## Déploiement

L'application est conçue pour être déployée sur **Vercel**. Les workflows GitHub Actions gèrent :
- CI sur chaque PR (lint + typecheck + tests + build)
- Tests E2E sur chaque PR et en nightly
- Déploiement automatique sur staging à chaque push sur `main`

## Licence

MIT

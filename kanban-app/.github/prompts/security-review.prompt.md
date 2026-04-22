---
mode: agent
description: Revue de sécurité d'un Route Handler ou module lib/
---

Effectue une revue de sécurité du fichier `${input:filePath}`.

## Points à vérifier

### Authentification & Autorisation
- [ ] Chaque handler vérifie que l'utilisateur est authentifié (`getCurrentUser()`).
- [ ] Les permissions sont vérifiées avec les fonctions de `lib/permissions/index.ts`.
- [ ] Aucune donnée sensible n'est retournée à un utilisateur non autorisé.

### Validation des entrées
- [ ] Toutes les entrées sont validées avec un schéma Zod.
- [ ] Aucune interpolation de chaîne SQL directe.
- [ ] Les UUIDs sont validés avant d'être utilisés en requête.

### Secrets
- [ ] `SUPABASE_SECRET_KEY` n'est jamais exposé côté client.
- [ ] Aucun `console.log` de tokens ou passwords.
- [ ] Les headers `Authorization` ne sont pas loggés.

### RLS Supabase
- [ ] Les requêtes utilisent le client server (SSR cookies) dans les Route Handlers.
- [ ] Le client admin (`createSupabaseAdminClient`) n'est utilisé que pour les opérations nécessitant de bypasser RLS (ex: seed, triggers).

### IDOR (Insecure Direct Object Reference)
- [ ] L'accès à une ressource par ID vérifie l'appartenance à l'espace de travail.
- [ ] Les boards/cartes/colonnes sont filtrés par workspace_id dans les requêtes.

Signale chaque problème avec : **Sévérité** (Critique/Haute/Moyenne/Faible), **Localisation** (ligne), **Description**, **Correction suggérée**.

---
mode: agent
description: Revue d'accessibilité WCAG 2.2 AA d'un composant
---

Effectue une revue d'accessibilité WCAG 2.2 AA du composant `${input:filePath}`.

## Critères à vérifier

### Perceptible
- [ ] **SC 1.1.1** — Chaque image a un `alt` (ou `alt=""` si décorative).
- [ ] **SC 1.3.1** — La structure sémantique est correcte (headings hiérarchiques, listes `<ul>`/`<ol>`).
- [ ] **SC 1.4.3** — Contraste de couleur ≥ 4.5:1 pour le texte normal.

### Utilisable
- [ ] **SC 2.1.1** — Toutes les fonctionnalités sont accessibles au clavier.
- [ ] **SC 2.4.3** — L'ordre de focus est logique.
- [ ] **SC 2.4.7** — Le focus est visible (`focus-visible:` Tailwind).
- [ ] **SC 2.5.3** — Les labels correspondent aux éléments visuels.
- [ ] **SC 2.5.7** — Alternative au drag-and-drop (bouton "Déplacer vers…").

### Compréhensible
- [ ] **SC 3.2.2** — Les changements de contexte sont initiés par l'utilisateur.
- [ ] **SC 3.3.1** — Les erreurs de saisie sont identifiées et décrites.

### Robuste
- [ ] **SC 4.1.2** — Tous les composants UI ont `name`, `role`, `value` appropriés.
- [ ] **SC 4.1.3** — Les annonces d'état utilisent `aria-live`.

### Modals
- [ ] Le focus est piégé dans le dialog (Radix `Dialog.Content` gère cela).
- [ ] `aria-modal="true"` est présent.
- [ ] Fermeture avec Échap.
- [ ] Le focus retourne à l'élément déclencheur à la fermeture.

Signale chaque problème avec la référence WCAG, la localisation et la correction suggérée.

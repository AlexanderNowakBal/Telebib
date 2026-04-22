---
mode: agent
description: Générer des tests E2E Playwright pour un flow utilisateur
---

Génère des tests E2E Playwright pour le flow : `${input:flowDescription}`.

## Exigences

1. Importer depuis `@playwright/test` : `test`, `expect`.
2. Utiliser les sélecteurs ARIA (`getByRole`, `getByLabel`, `getByText`) — jamais de sélecteurs CSS fragiles.
3. Attendre les navigations avec `page.waitForURL()`.
4. Chaque test doit être indépendant (pas de dépendance d'état entre tests).
5. Utiliser `test.beforeEach` pour la configuration commune.
6. Nommer les tests avec le format `"T-XX : Description"`.

## Template

```ts
import { test, expect } from "@playwright/test";

test.describe("Flow — ${input:flowDescription}", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/sign-in");
    // Auth setup...
  });

  test("T-XX : Cas nominal", async ({ page }) => {
    // Arrange
    await page.goto("/...");
    
    // Act
    await page.getByRole("button", { name: /action/i }).click();
    
    // Assert
    await expect(page.getByText("Résultat attendu")).toBeVisible();
  });
});
```

## Tests d'accessibilité intégrés

Ajouter un test axe-core pour chaque page significative du flow :

```ts
import AxeBuilder from "@axe-core/playwright";

const results = await new AxeBuilder({ page })
  .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
  .analyze();
expect(results.violations).toHaveLength(0);
```

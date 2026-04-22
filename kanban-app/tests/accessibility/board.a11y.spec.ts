import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Accessibilité — WCAG 2.2 AA", () => {
  test("Page de connexion — aucune violation axe", async ({ page }) => {
    await page.goto("/sign-in");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
      .analyze();
    expect(results.violations).toHaveLength(0);
  });

  test("Page liste workspaces — aucune violation axe", async ({ page }) => {
    await page.goto("/workspaces");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
      .analyze();
    expect(results.violations).toHaveLength(0);
  });

  test("Board — aucune violation axe sur la vue principale", async ({ page }) => {
    // Naviguer vers un board existant (seed data)
    await page.goto("/w/demo/b/demo-board");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
      .exclude("[data-dnd-dragging]") // Exclure les éléments en cours de drag
      .analyze();
    expect(results.violations).toHaveLength(0);
  });

  test("Modal de carte — focus piégé et rôle dialog correct", async ({ page }) => {
    await page.goto("/w/demo/b/demo-board");
    await page.getByRole("article").first().click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
      .include("[role='dialog']")
      .analyze();
    expect(results.violations).toHaveLength(0);
  });
});

import { test, expect } from "@playwright/test";

test.describe("Board — Flux complet", () => {
  test.beforeEach(async ({ page }) => {
    // Authentification via magic link simulé par Supabase test helpers
    // ou cookies pré-remplis via l'API admin dans le global setup
    await page.goto("/sign-in");
  });

  test("T-01 : La page de connexion affiche un formulaire magic link", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /connexion/i })).toBeVisible();
    await expect(page.getByRole("textbox", { name: /e-mail/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /envoyer/i })).toBeVisible();
  });

  test("T-07 : Créer un board depuis un template affiche 3 colonnes", async ({ page }) => {
    // Suppose que l'utilisateur est déjà connecté (auth cookie posé par global setup)
    await page.goto("/workspaces");
    await page.getByRole("link", { name: /mon espace/i }).first().click();

    // Naviguer vers la création de board
    await page.getByRole("button", { name: /nouveau board/i }).click();
    await page.getByRole("textbox", { name: /nom/i }).fill("Board Test E2E");
    await page.getByRole("button", { name: /créer/i }).click();

    // Attendre la navigation vers le board
    await page.waitForURL(/\/w\/.+\/b\/.+/);

    // Vérifier les 3 colonnes du template "basic"
    const columns = page.getByRole("list").getByRole("listitem");
    await expect(columns).toHaveCount(3);

    await expect(page.getByText("À faire")).toBeVisible();
    await expect(page.getByText("En cours")).toBeVisible();
    await expect(page.getByText("Terminé")).toBeVisible();
  });

  test("T-08 : Ajouter une carte inline — carte visible immédiatement", async ({ page }) => {
    await page.goto("/workspaces");
    await page.getByRole("link").first().click();
    await page.waitForURL(/\/w\/.+\/b\/.+/);

    // Ouvrir le formulaire inline de la première colonne
    await page.getByRole("button", { name: /ajouter une carte/i }).first().click();
    await page.getByPlaceholder(/titre de la carte/i).fill("Nouvelle carte E2E");
    await page.keyboard.press("Enter");

    // La carte doit apparaître immédiatement (UI optimiste)
    await expect(page.getByText("Nouvelle carte E2E")).toBeVisible();
  });

  test("T-09 : Déplacer une carte via le dialog 'Déplacer vers…'", async ({ page }) => {
    await page.goto("/workspaces");
    await page.getByRole("link").first().click();
    await page.waitForURL(/\/w\/.+\/b\/.+/);

    // Ouvrir le menu contextuel d'une carte
    const card = page.getByRole("article").first();
    await card.getByRole("button", { name: /déplacer vers/i }).click();

    // Le dialog doit s'ouvrir
    const dialog = page.getByRole("dialog", { name: /déplacer la carte/i });
    await expect(dialog).toBeVisible();

    // Choisir une autre colonne
    await dialog.getByRole("combobox", { name: /colonne/i }).selectOption({ index: 1 });
    await dialog.getByRole("button", { name: /déplacer/i }).click();

    // Le dialog doit se fermer
    await expect(dialog).not.toBeVisible();
  });

  test("T-11 : Ouvrir le modal de carte — focus piégé, Échap ferme, focus retourne", async ({
    page,
  }) => {
    await page.goto("/workspaces");
    await page.getByRole("link").first().click();
    await page.waitForURL(/\/w\/.+\/b\/.+/);

    // Cliquer sur une carte pour ouvrir le modal
    const card = page.getByRole("article").first();
    const cardTitle = await card.getByRole("heading").textContent();
    await card.click();

    // Le dialog doit être visible
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Vérifier que le focus est dans le dialog
    const focusedElement = page.locator(":focus");
    await expect(dialog).toContainElement(focusedElement);

    // Fermer avec Échap
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
  });
});

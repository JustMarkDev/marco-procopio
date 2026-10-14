import { expect, test } from "@playwright/test";

test("home renders and the nav reaches every page", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  // Headlines animate word by word: check the accessible name, not the raw text.
  await expect(page.getByRole("heading", { level: 1, name: "Marco Procopio" })).toBeVisible();

  const nav = page.getByRole("navigation", { name: "Pages" });
  await nav.getByRole("link", { name: "work" }).click();
  await expect(page).toHaveURL(/\/work$/);
  await expect(page.getByRole("heading", { level: 1, name: "Work" })).toBeVisible();
  // Private projects are plain rows; the others link out.
  await expect(page.getByRole("link", { name: /Database Contatti/ })).toHaveCount(0);
  await expect(page.getByRole("link", { name: /Music Companion/ })).toHaveCount(1);

  await nav.getByRole("link", { name: "about" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "say ciao." })).toBeVisible();
});

test("the email copies to the clipboard", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/about");
  await page.getByRole("button", { name: "copy" }).click();
  await expect(page.getByRole("button", { name: "copied" })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    "procopiomarco@protonmail.com",
  );
});

test.describe("Italian browsers", () => {
  test.use({ locale: "it-IT" });

  test("get Italian on the same URL", async ({ page }) => {
    await page.goto("/work");
    await expect(page.locator("html")).toHaveAttribute("lang", "it");
    await expect(page.getByRole("heading", { level: 1, name: "Lavori" })).toBeVisible();
  });
});

test("old URLs redirect and the hidden language segment isn't reachable", async ({ page }) => {
  await page.goto("/it/work/music-companion");
  await expect(page).toHaveURL(/\/work$/);

  const response = await page.goto("/en/work");
  expect(response?.status()).toBe(404);
});

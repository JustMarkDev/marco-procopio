import { expect, test } from "@playwright/test";

test("home renders, switches theme and copies the email", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Marco Procopio");
  await expect(page.getByRole("link", { name: "Case study" })).toHaveCount(4);

  const html = page.locator("html");
  const wasDark = (await html.getAttribute("class"))?.includes("dark") ?? false;
  await page.getByRole("button", { name: /Switch to (dark|light) theme/ }).click();
  await expect(html).toHaveClass(wasDark ? /light/ : /dark/);

  await page.getByRole("button", { name: "Copy email address" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Email address copied" })).toHaveCount(1);
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    "procopiomarco@protonmail.com",
  );
});

test("Italian case study page is linked from the language switch", async ({ page }) => {
  await page.goto("/work/music-companion");
  await page.getByRole("link", { name: "Leggi in italiano" }).click();
  await expect(page).toHaveURL(/\/it\/work\/music-companion$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "it");
  await expect(page.getByRole("heading", { name: "Cosa ho costruito" })).toBeVisible();
});

import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("loads and contains hero headline text", async ({ page }) => {
    // The Hero h1 reads: "The world, precisely yours."
    await expect(
      page.locator("text=precisely yours").first()
    ).toBeVisible();
  });

  test("Navbar contains a DESTINATIONS link", async ({ page }) => {
    // Desktop nav renders DESTINATIONS links — use the one inside <nav aria-label="Main navigation">
    const destinationsLink = page
      .locator('nav[aria-label="Main navigation"] a', { hasText: "DESTINATIONS" });
    await expect(destinationsLink).toBeVisible();
  });

  test("Plan A Journey button/link is visible", async ({ page }) => {
    // The "Plan A Journey" CTA is rendered as a link in the Navbar (hidden below sm breakpoint).
    // Playwright default viewport is 1280×720 so it is visible.
    const planBtn = page.locator('a', { hasText: /Plan A Journey/i }).first();
    await expect(planBtn).toBeVisible();
  });
});

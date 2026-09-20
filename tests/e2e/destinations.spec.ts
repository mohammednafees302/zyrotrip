import { test, expect } from "@playwright/test";

test.describe("Destinations page", () => {
  test("navigates to /destinations and renders main content", async ({ page }) => {
    await page.goto("/destinations");
    await page.waitForLoadState("networkidle");

    // The page wraps content in a <main> element inside DestinationsPage
    const main = page.locator("main").first();
    await expect(main).toBeVisible();
  });

  test("URL is /destinations after navigation", async ({ page }) => {
    await page.goto("/destinations");
    await page.waitForLoadState("networkidle");

    expect(page.url()).toContain("/destinations");
  });
});

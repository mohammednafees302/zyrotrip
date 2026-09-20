import { test, expect } from "@playwright/test";

test.describe("Auth pages", () => {
  test("login page has an email input field", async ({ page }) => {
    await page.goto("/auth/login");
    await page.waitForLoadState("networkidle");

    // Login form has <input id="email" type="email" />
    const emailInput = page.locator('input[type="email"]').first();
    await expect(emailInput).toBeVisible();
  });

  test("register page has a form", async ({ page }) => {
    await page.goto("/auth/register");
    await page.waitForLoadState("networkidle");

    // Register page renders a <form> with multiple fields
    const form = page.locator("form").first();
    await expect(form).toBeVisible();
  });
});

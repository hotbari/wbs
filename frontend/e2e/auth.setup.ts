import { test as setup, expect } from "@playwright/test";

const adminAuthFile = "e2e/.auth/admin.json";

setup("authenticate as admin", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("Email").fill("admin@test.com");
  await page.getByPlaceholder("Password").fill("password");
  await page.getByRole("button", { name: /sign in/i }).click();

  // Wait for redirect and page to fully load
  await page.waitForURL("**/employees", { timeout: 15000 });
  await expect(page.getByRole("heading", { name: "Employees" })).toBeVisible({ timeout: 10000 });

  await page.context().storageState({ path: adminAuthFile });
});

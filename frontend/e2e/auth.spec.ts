import { test, expect } from "@playwright/test";

// These tests don't use stored auth state
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Authentication", () => {
  test("redirects unauthenticated user to login", async ({ page }) => {
    await page.goto("/employees");
    await expect(page).toHaveURL(/\/login/);
  });

  test("shows login form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByPlaceholder("Email")).toBeVisible();
    await expect(page.getByPlaceholder("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("rejects invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("Email").fill("admin@test.com");
    await page.getByPlaceholder("Password").fill("wrongpassword");
    await page.getByRole("button", { name: /sign in/i }).click();

    // Should stay on login page (not redirect to employees)
    await page.waitForTimeout(3000);
    await expect(page).toHaveURL(/\/login/);
  });

  test("admin can login successfully", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("Email").fill("admin@test.com");
    await page.getByPlaceholder("Password").fill("password");
    await page.getByRole("button", { name: /sign in/i }).click();

    await page.waitForURL("**/employees");
    await expect(page.getByRole("heading", { name: "Employees" })).toBeVisible();
  });

  test("employee can login", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("Email").fill("employee@test.com");
    await page.getByPlaceholder("Password").fill("password");
    await page.getByRole("button", { name: /sign in/i }).click();

    await page.waitForURL("**/employees");
    await expect(page.getByRole("heading", { name: "Employees" })).toBeVisible();
  });
});

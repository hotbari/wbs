import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("navbar shows all admin links", async ({ page }) => {
    await page.goto("/employees");
    const nav = page.locator("nav");

    await expect(nav.getByText("Employees")).toBeVisible();
    await expect(nav.getByText("Projects")).toBeVisible();
    await expect(nav.getByText("Allocations")).toBeVisible();
    await expect(nav.getByText("Skills")).toBeVisible();
    await expect(nav.getByText("Dashboard")).toBeVisible();
  });

  test("can navigate between pages", async ({ page }) => {
    await page.goto("/employees");

    // Go to Projects
    await page.locator("nav").getByText("Projects").click();
    await expect(page).toHaveURL(/\/projects/);
    await expect(page.getByRole("heading", { name: "Projects" })).toBeVisible();

    // Go to Skills
    await page.locator("nav").getByText("Skills").click();
    await expect(page).toHaveURL(/\/admin\/skills/);

    // Go to Dashboard
    await page.locator("nav").getByText("Dashboard").click();
    await expect(page).toHaveURL(/\/admin\/dashboard/);

    // Go to Allocations
    await page.locator("nav").getByText("Allocations").click();
    await expect(page).toHaveURL(/\/admin\/allocations/);

    // Go back to Employees
    await page.locator("nav").getByText("Employees").click();
    await expect(page).toHaveURL(/\/employees/);
  });

  test("root path redirects to employees", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/employees/);
  });
});

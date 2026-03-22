import { test, expect } from "@playwright/test";

test.describe("Employees", () => {
  test("shows employees list page", async ({ page }) => {
    await page.goto("/employees");
    await expect(page.getByRole("heading", { name: "Employees" })).toBeVisible();
  });

  test("shows Add Employee button for admin", async ({ page }) => {
    await page.goto("/employees");
    await expect(page.getByText("Add Employee")).toBeVisible();
  });

  test("search filters employees", async ({ page }) => {
    await page.goto("/employees");
    const searchInput = page.getByPlaceholder("Search by name...");
    await expect(searchInput).toBeVisible();
    await searchInput.fill("zzznonexistent");
    await expect(page.getByText("No employees found.")).toBeVisible();
  });

  test("can navigate to employee detail", async ({ page }) => {
    await page.goto("/employees");
    const firstCard = page.locator("a[href^='/employees/']").first();
    await firstCard.waitFor({ state: "visible", timeout: 10000 });
    await firstCard.click();
    await expect(page).toHaveURL(/\/employees\/.+/);
    await expect(page.getByText("DETAILS")).toBeVisible();
  });

  test("admin can create a new employee", async ({ page }) => {
    await page.goto("/admin/employees/new");
    await expect(page.getByRole("heading", { name: "Add Employee" })).toBeVisible();

    // Inputs are: Full Name, Email, Password, Phone, Department, Team, Job Title, Grade
    const textInputs = page.locator("input:not([type='date']):not([type='hidden'])");
    await textInputs.nth(0).fill("E2E Test User");              // Full Name
    await textInputs.nth(1).fill(`e2e-${Date.now()}@test.com`); // Email
    await textInputs.nth(2).fill("testpassword123");             // Password
    await textInputs.nth(3).fill("010-1234-5678");               // Phone (valid format)
    await textInputs.nth(4).fill("QA");                          // Department
    // nth(5) = Team - skip
    await textInputs.nth(6).fill("QA Engineer");                 // Job Title
    // nth(7) = Grade - skip

    await page.locator("input[type='date']").fill("2024-01-15");

    await page.getByRole("button", { name: /save/i }).click();
    await page.waitForURL(/\/employees\/.+/, { timeout: 15000 });
    await expect(page.getByText("E2E Test User")).toBeVisible();
  });
});

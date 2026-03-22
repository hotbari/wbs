import { test, expect } from "@playwright/test";

test.describe("Admin Pages", () => {
  test("dashboard shows stats", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await expect(page.getByText("Active Employees")).toBeVisible();
    await expect(page.getByText("Avg Allocation")).toBeVisible();
  });

  test("skills page shows skill management", async ({ page }) => {
    await page.goto("/admin/skills");
    await expect(page.getByPlaceholder("Skill name")).toBeVisible();
    await expect(page.getByPlaceholder("Category")).toBeVisible();
  });

  test("can add a skill", async ({ page }) => {
    const skillName = `E2E Skill ${Date.now()}`;
    await page.goto("/admin/skills");

    await page.getByPlaceholder("Skill name").fill(skillName);
    await page.getByPlaceholder("Category").fill("Testing");
    await page.getByRole("button", { name: "Add" }).click();

    await expect(page.getByText(skillName)).toBeVisible({ timeout: 10000 });
  });

  test("allocations page loads", async ({ page }) => {
    await page.goto("/admin/allocations");
    await expect(page.getByRole("heading", { name: "Allocations" })).toBeVisible();
    await expect(page.getByText("Add Allocation")).toBeVisible();
  });
});

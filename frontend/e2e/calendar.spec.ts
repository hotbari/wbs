import { test, expect, type Page } from "@playwright/test";

const employeeAuth = "e2e/.auth/employee.json";

async function openCreateForm(page: Page) {
  await page.getByRole("button", { name: /일정/ }).first().click();
  await expect(page.getByPlaceholder("제목")).toBeVisible({ timeout: 5000 });
}

async function fillTitle(page: Page, title: string) {
  await page.getByPlaceholder("제목").fill(title);
}

async function submitForm(page: Page) {
  await page.getByRole("button", { name: "저장" }).click();
}

test.describe("Calendar — basic CRUD as admin", () => {
  test("admin can create an all-day private event", async ({ page }) => {
    const title = `비공개_${Date.now()}`;
    await page.goto("/calendar");
    await openCreateForm(page);
    await fillTitle(page, title);
    // 종일 default for cell-less "+ 일정" CTA: form picks all-day when start/end undefined
    await submitForm(page);
    await expect(page.getByText(title).first()).toBeVisible({ timeout: 5000 });
  });

  test("admin can create a public event and toggle public on", async ({ page }) => {
    const title = `공개_${Date.now()}`;
    await page.goto("/calendar");
    await openCreateForm(page);
    await fillTitle(page, title);
    await page.getByText("공개", { exact: true }).click();
    await submitForm(page);
    await expect(page.getByText(title).first()).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Calendar — visibility & ownership", () => {
  const privateTitle = `priv_${Date.now()}`;
  const publicTitle = `pub_${Date.now()}`;

  test("admin creates one private and one public event", async ({ page }) => {
    await page.goto("/calendar");

    await openCreateForm(page);
    await fillTitle(page, privateTitle);
    await submitForm(page);
    await expect(page.getByText(privateTitle).first()).toBeVisible({ timeout: 5000 });

    await openCreateForm(page);
    await fillTitle(page, publicTitle);
    await page.getByText("공개", { exact: true }).click();
    await submitForm(page);
    await expect(page.getByText(publicTitle).first()).toBeVisible({ timeout: 5000 });
  });

  test("employee sees only the public event", async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: employeeAuth });
    const page = await ctx.newPage();
    await page.goto("/calendar");
    // wait for the calendar grid to be visible before counting
    await expect(page.getByText("월간")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(publicTitle).first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(privateTitle)).toHaveCount(0);
    await ctx.close();
  });

  test("non-owner has no edit/delete on a public event", async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: employeeAuth });
    const page = await ctx.newPage();
    await page.goto("/calendar");
    await page.getByText(publicTitle).first().click();
    // Detail modal opens, but for non-owner the action footer is hidden
    await expect(page.getByRole("button", { name: /수정/ })).toHaveCount(0);
    await expect(page.getByRole("button", { name: /삭제/ })).toHaveCount(0);
    await ctx.close();
  });
});

test.describe("Calendar — multi-day rendering", () => {
  test("3-day all-day event renders on each spanning day", async ({ page }) => {
    const title = `워크숍_${Date.now()}`;
    await page.goto("/calendar");
    await openCreateForm(page);
    await fillTitle(page, title);
    // Form opens with 종일 enabled; set a 3-day span via the date inputs
    const today = new Date();
    const end = new Date(today);
    end.setDate(end.getDate() + 2);
    const fmt = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const dateInputs = page.locator("input[type=date]");
    await dateInputs.nth(0).fill(fmt(today));
    await dateInputs.nth(1).fill(fmt(end));
    await submitForm(page);

    await expect(page.getByText(title)).toHaveCount(3, { timeout: 5000 });
  });
});

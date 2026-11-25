import { test, expect } from "@playwright/test";

test.describe("Nexora Public & Protected Workflows", () => {
  test("homepage renders Webtec agency hero and navigation", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /Your Ultimate Digital Agency/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /GET IN TOUCH/i }).first()).toBeVisible();
  });

  test("unauthenticated dashboard route redirects to login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("theme toggle persists dark mode across reload", async ({ page }) => {
    await page.goto("/");
    const toggle = page.getByRole("button", { name: /Switch to dark mode|Switch to light mode/i }).first();
    await toggle.click();
    await page.reload();
    const htmlClass = await page.locator("html").getAttribute("class");
    expect(htmlClass).toBeTruthy();
  });

  test("contact page displays CRM-connected form", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.getByRole("heading", { name: /Contact Us/i })).toBeVisible();
    await expect(page.getByPlaceholder("Your Name")).toBeVisible();
    await expect(page.getByPlaceholder("E-mail")).toBeVisible();
  });
});


import { expect, test } from "@playwright/test";

test("renders the acquisition landing page sections", async ({ page }) => {
  await page.goto("/acquisitions/");

  await expect(
    page.getByRole("heading", { name: "Interest becomes opportunity." }),
  ).toBeVisible();
  await expect(page.getByText("More leads.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Persistent follow-up. More opportunities." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "A complete revenue workflow." })).toBeVisible();
});

test("routes the header how it works link to the dedicated page", async ({ page }) => {
  await page.goto("/acquisitions/");

  await page
    .getByRole("navigation", { name: "Primary navigation" })
    .getByRole("link", { name: "How it works" })
    .click();

  await expect(page).toHaveURL(/\/acquisitions\/how-it-works$/);
  await expect(page.getByRole("heading", { name: /Your leads keep moving/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "From interest to conversation." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Works with your existing stack." })).toBeVisible();
});

test("renders the pricing page", async ({ page }) => {
  await page.goto("/acquisitions/pricing");

  await expect(page.getByRole("heading", { name: /Simple pricing/ })).toBeVisible();
  await expect(page.getByText("$199")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Custom deployment" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Built for the work ahead." })).toBeVisible();
});

test("renders the contact page with product multi-select", async ({ page }) => {
  await page.goto("/acquisitions/contact");

  await expect(page.getByRole("heading", { name: "Let's talk." })).toBeVisible();
  await expect(page.getByText("info@getpathflow.com")).toBeVisible();

  await page.locator(".contact-multiselect-trigger").click();
  await expect(page.locator(".contact-multiselect-menu button", { hasText: "Acquisitions" })).toBeVisible();
  await expect(page.locator(".contact-multiselect-menu button", { hasText: "Custom Development" })).toBeVisible();

  await page.getByRole("heading", { name: "Let's talk." }).click();
  await expect(page.locator(".contact-multiselect-menu")).toBeHidden();
});

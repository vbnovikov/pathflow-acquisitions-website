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

test("keeps the header brand aligned across pages", async ({ page }) => {
  const routes = ["/acquisitions/", "/acquisitions/how-it-works", "/acquisitions/pricing", "/acquisitions/contact"];
  let baseline: { x: number; y: number } | undefined;

  for (const route of routes) {
    await page.goto(route);
    const brandMark = await page.locator(".brand-mark").boundingBox();

    expect(brandMark, `${route} brand mark`).not.toBeNull();

    if (!baseline) {
      baseline = { x: brandMark!.x, y: brandMark!.y };
    }

    expect(Math.abs(brandMark!.x - baseline.x), `${route} brand x`).toBeLessThan(1);
    expect(Math.abs(brandMark!.y - baseline.y), `${route} brand y`).toBeLessThan(1);
  }
});

test("keeps the mobile hero and persistent nav within the viewport", async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 852 });
  const routes = ["/acquisitions/", "/acquisitions/how-it-works", "/acquisitions/pricing", "/acquisitions/contact"];

  for (const route of routes) {
    await page.goto(route);

    const header = page.locator(".site-header");
    await expect(header).toHaveCSS("position", "fixed");
    await expect(header.locator(".header-actions")).toBeHidden();
    await expect(page.getByRole("navigation", { name: "Primary navigation" })).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: "Pricing" }),
    ).toBeVisible();

    const navMetrics = await page.evaluate(() => {
      const headerRect = document.querySelector(".site-header")?.getBoundingClientRect();

      return {
        clientWidth: document.documentElement.clientWidth,
        headerLeft: headerRect?.left ?? 0,
        headerRight: headerRect?.right ?? 0,
        scrollWidth: document.documentElement.scrollWidth,
      };
    });

    expect(navMetrics.scrollWidth, `${route} page width`).toBe(navMetrics.clientWidth);
    expect(navMetrics.headerLeft, `${route} header left`).toBe(0);
    expect(Math.round(navMetrics.headerRight), `${route} header right`).toBe(navMetrics.clientWidth);
  }

  await page.goto("/acquisitions/");

  const metrics = await page.evaluate(() => {
    const heading = document.querySelector(".hero-section h1")?.getBoundingClientRect();
    const heroVisual = document.querySelector(".hero-visual")?.getBoundingClientRect();
    const progress = document.querySelector(".hero-progress");
    const visiblePanelRights = Array.from(
      document.querySelectorAll(".home-hero-storyboard .software-panel-surface"),
    )
      .map((element) => element.getBoundingClientRect())
      .filter((rect) => rect.width > 0 && rect.height > 0)
      .map((rect) => rect.right);

    return {
      clientWidth: document.documentElement.clientWidth,
      heroVisualRight: heroVisual?.right ?? 0,
      headingRight: heading?.right ?? 0,
      maxPanelRight: Math.max(...visiblePanelRights),
      progressClientWidth: progress?.clientWidth ?? 0,
      progressScrollWidth: progress?.scrollWidth ?? 0,
      scrollWidth: document.documentElement.scrollWidth,
    };
  });

  expect(metrics.scrollWidth).toBe(metrics.clientWidth);
  expect(metrics.headingRight).toBeLessThanOrEqual(metrics.clientWidth);
  expect(metrics.maxPanelRight).toBeLessThanOrEqual(metrics.heroVisualRight + 1);
  expect(metrics.progressScrollWidth).toBeLessThanOrEqual(metrics.progressClientWidth + 1);

  await page.goto("/acquisitions/how-it-works");
  await expect(page.locator(".how-event-stack")).toBeHidden();
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

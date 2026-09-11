import { expect, test, type Page } from "@playwright/test";
import {
  MOBILE_LONG_FIXTURE,
  seedAuthenticatedSession,
  setupUserWebApiMocks,
} from "./support/user-web-api-mocks";

const MOBILE_ROUTES: ReadonlyArray<{
  readonly path: string;
  readonly expectedText: string;
  readonly hasMobileHeader: boolean;
}> = [
  { path: "/app", expectedText: MOBILE_LONG_FIXTURE.email, hasMobileHeader: true },
  { path: "/app?account=settings", expectedText: MOBILE_LONG_FIXTURE.email, hasMobileHeader: true },
  { path: "/app/more", expectedText: MOBILE_LONG_FIXTURE.email, hasMobileHeader: true },
];

test.describe("G02 mobile browser release QA", () => {
  test("redirects protected mobile routes without a session", async ({ page }) => {
    const api = await setupUserWebApiMocks(page);
    const runtime = collectRuntimeErrors(page);

    await page.goto("/app");

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("button", { name: "Google" })).toBeVisible();
    expect(api.protectedRequestsWithoutAuthorization()).toEqual([]);
    runtime.assertClean();
  });

  test("loads core App routes without mobile shell overlap or page overflow", async ({ page }, testInfo) => {
    const api = await setupUserWebApiMocks(page);
    const runtime = collectRuntimeErrors(page);
    await seedAuthenticatedSession(page);

    for (const route of MOBILE_ROUTES) {
      await page.goto(route.path);
      await expect(page.locator("body")).toContainText(route.expectedText);
      await expectMobileShell(page, route.hasMobileHeader);
      await expectNoDocumentHorizontalOverflow(page, `${testInfo.project.name} ${route.path}`);
    }

    expect(api.protectedRequestsWithoutAuthorization()).toEqual([]);
    runtime.assertClean();
  });
});

function bottomNav(page: Page) {
  return page.locator("nav").last();
}

async function expectMobileShell(page: Page, hasMobileHeader: boolean) {
  await expect(bottomNav(page)).toBeVisible();

  if (hasMobileHeader) {
    await expect(page.getByTestId("mobile-app-header")).toBeVisible();
  }
}

async function expectNoDocumentHorizontalOverflow(page: Page, label: string) {
  const metrics = await page.evaluate(() => ({
    documentScrollWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
  }));

  expect(metrics.documentScrollWidth, label).toBeLessThanOrEqual(metrics.viewportWidth + 2);
}

function collectRuntimeErrors(page: Page) {
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];

  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" && !message.text().includes("favicon.ico")) {
      consoleErrors.push(message.text());
    }
  });

  return {
    assertClean() {
      expect({ consoleErrors, pageErrors }).toEqual({ consoleErrors: [], pageErrors: [] });
    },
  };
}

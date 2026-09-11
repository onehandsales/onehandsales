import { expect, test, type Page } from "@playwright/test";
import {
  MOBILE_LONG_FIXTURE,
  seedAuthenticatedSession,
  setupUserWebApiMocks,
} from "./support/user-web-api-mocks";

test.describe("G03 Chrome/Edge desktop browser compatibility QA", () => {
  test("checks login entry and protected route redirect", async ({ page }) => {
    const api = await setupUserWebApiMocks(page);
    const runtime = collectRuntimeErrors(page);

    await page.goto("/app");

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("button", { name: "Google" })).toBeVisible();
    expect(api.protectedRequestsWithoutAuthorization()).toEqual([]);

    await page.goto("/en-us/login");
    await expect(page.getByRole("heading", { name: "Your AI workspace" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Google" })).toBeVisible();

    runtime.assertClean();
  });

  test("loads the user workspace", async ({ page }) => {
    const api = await setupUserWebApiMocks(page);
    const runtime = collectRuntimeErrors(page);
    await seedAuthenticatedSession(page);

    await page.goto("/app");
    await expect(page.locator("body")).toContainText(MOBILE_LONG_FIXTURE.email);

    await page.goto("/app/more");
    await expect(page.locator("body")).toContainText(MOBILE_LONG_FIXTURE.email);

    expect(api.protectedRequestsWithoutAuthorization()).toEqual([]);
    runtime.assertClean();
  });

  test("keeps route state through reload and browser history", async ({ page }) => {
    await setupUserWebApiMocks(page);
    const runtime = collectRuntimeErrors(page);
    await seedAuthenticatedSession(page);

    await page.goto("/app");
    await expect(page.locator("body")).toContainText(MOBILE_LONG_FIXTURE.email);

    await page.reload();
    await expect(page).toHaveURL(/\/app$/);
    await expect(page.locator("body")).toContainText(MOBILE_LONG_FIXTURE.email);

    await page.goto("/app/more");
    await expect(page).toHaveURL(/\/app\/more$/);
    await expect(page.locator("body")).toContainText(MOBILE_LONG_FIXTURE.email);

    await page.goBack();
    await expect(page).toHaveURL(/\/app$/);
    await expect(page.locator("body")).toContainText(MOBILE_LONG_FIXTURE.email);

    await page.goForward();
    await expect(page).toHaveURL(/\/app\/more$/);
    await expect(page.locator("body")).toContainText(MOBILE_LONG_FIXTURE.email);

    runtime.assertClean();
  });

  test("shows loading state while profile API responses are delayed", async ({ page }) => {
    await setupUserWebApiMocks(page, {
      delayMs: (request) =>
        request.method === "GET" && request.pathname === "/api/users/me/profile" ? 1_200 : 0,
    });
    const runtime = collectRuntimeErrors(page);
    await seedAuthenticatedSession(page);

    const profileResponse = page.waitForResponse(
      (response) =>
        response.request().method() === "GET" &&
        new URL(response.url()).pathname === "/api/users/me/profile",
    );

    await page.goto("/app");
    await expect(page.locator(".animate-pulse").first()).toBeVisible();

    await profileResponse;
    await expect(page.locator("body")).toContainText(MOBILE_LONG_FIXTURE.email);

    runtime.assertClean();
  });
});

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

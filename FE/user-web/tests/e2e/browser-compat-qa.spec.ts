import { expect, test, type Page } from "@playwright/test";
import {
  MOBILE_LONG_FIXTURE,
  createUserWebApiMockStore,
  seedAuthenticatedSession,
  setupUserWebApiMocks,
} from "./support/user-web-api-mocks";

const MULTI_TAB_UPDATED_COMPANY = "RQA003 updated company";

test.describe("G03 Chrome/Edge desktop browser compatibility QA", () => {
  test("checks login entry and protected route redirect", async ({ page }) => {
    const api = await setupUserWebApiMocks(page);
    const runtime = collectRuntimeErrors(page);

    await page.goto("/app/companies");

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("button", { name: "Google" })).toBeVisible();
    expect(api.protectedRequestsWithoutAuthorization()).toEqual([]);

    await page.goto("/en-us/login");
    await expect(page.getByRole("heading", { name: "Your AI workspace" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Google" })).toBeVisible();

    runtime.assertClean();
  });

  test("loads the company workspace", async ({ page }) => {
    const api = await setupUserWebApiMocks(page);
    const runtime = collectRuntimeErrors(page);
    await seedAuthenticatedSession(page);

    await page.goto("/app");
    await expect(page.locator("body")).toContainText(MOBILE_LONG_FIXTURE.companyName);

    await page.goto("/app/companies");
    await expect(page.locator("body")).toContainText(MOBILE_LONG_FIXTURE.companyName);

    await page.goto("/app/trash");
    await expect(page.locator("body")).toContainText("Deleted company");

    expect(api.protectedRequestsWithoutAuthorization()).toEqual([]);
    runtime.assertClean();
  });

  test("keeps route state through reload and browser history", async ({ page }) => {
    await setupUserWebApiMocks(page);
    const runtime = collectRuntimeErrors(page);
    await seedAuthenticatedSession(page);

    await page.goto("/app/companies");
    await expect(page.locator("body")).toContainText(MOBILE_LONG_FIXTURE.companyName);

    await page.reload();
    await expect(page).toHaveURL(/\/app\/companies$/);
    await expect(page.locator("body")).toContainText(MOBILE_LONG_FIXTURE.companyName);

    await page.goto("/app/trash");
    await expect(page).toHaveURL(/\/app\/trash$/);
    await expect(page.locator("body")).toContainText("Deleted company");

    await page.goBack();
    await expect(page).toHaveURL(/\/app\/companies$/);
    await expect(page.locator("body")).toContainText(MOBILE_LONG_FIXTURE.companyName);

    await page.goForward();
    await expect(page).toHaveURL(/\/app\/trash$/);
    await expect(page.locator("body")).toContainText("Deleted company");

    runtime.assertClean();
  });

  test("keeps shared company data stable across two tabs after refresh", async ({ context, page }) => {
    const store = createUserWebApiMockStore();
    await setupUserWebApiMocks(page, { store });
    const runtime = collectRuntimeErrors(page);
    await seedAuthenticatedSession(page);

    const secondPage = await context.newPage();
    await setupUserWebApiMocks(secondPage, { store });
    const secondRuntime = collectRuntimeErrors(secondPage);
    await seedAuthenticatedSession(secondPage);

    await page.goto("/app/companies");
    await secondPage.goto("/app/companies");
    await expect(page.locator("body")).toContainText(MOBILE_LONG_FIXTURE.companyName);
    await expect(secondPage.locator("body")).toContainText(MOBILE_LONG_FIXTURE.companyName);

    await updateCompanyNameFromBrowser(page, MULTI_TAB_UPDATED_COMPANY);
    await secondPage.reload();

    await expect(secondPage.locator("body")).toContainText(MULTI_TAB_UPDATED_COMPANY);
    await expect(secondPage.locator("body")).not.toContainText(MOBILE_LONG_FIXTURE.companyName);

    runtime.assertClean();
    secondRuntime.assertClean();
    await secondPage.close();
  });

  test("shows loading state while API responses are delayed", async ({ page }) => {
    await setupUserWebApiMocks(page, {
      delayMs: (request) =>
        request.method === "GET" && request.pathname === "/api/companies" ? 1_200 : 0,
    });
    const runtime = collectRuntimeErrors(page);
    await seedAuthenticatedSession(page);

    const companiesResponse = page.waitForResponse(
      (response) =>
        response.request().method() === "GET" &&
        new URL(response.url()).pathname === "/api/companies",
    );

    await page.goto("/app/companies");
    await expect(page.locator(".animate-pulse").first()).toBeVisible();

    await companiesResponse;
    await expect(page.locator("body")).toContainText(MOBILE_LONG_FIXTURE.companyName);

    runtime.assertClean();
  });
});

async function updateCompanyNameFromBrowser(page: Page, companyName: string) {
  await page.evaluate(async (nextCompanyName) => {
    const accessToken = window.localStorage.getItem("onehand.userWeb.accessToken");
    const response = await window.fetch(
      "http://localhost:3000/api/companies/company-mobile-001",
      {
        body: JSON.stringify({ companyName: nextCompanyName }),
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        method: "PATCH",
      },
    );

    if (!response.ok) {
      throw new Error(`Company update failed: ${response.status}`);
    }
  }, companyName);
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

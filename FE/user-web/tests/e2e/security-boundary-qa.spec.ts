import { expect, test, type Page } from "@playwright/test";
import {
  MOBILE_LONG_FIXTURE,
  setupUserWebApiMocks,
} from "./support/user-web-api-mocks";

test.describe("G04 User Web security boundary QA", () => {
  test("does not show protected data after session removal and browser back", async ({
    page,
  }) => {
    const api = await setupUserWebApiMocks(page);
    const runtime = collectRuntimeErrors(page);

    await page.goto("/login");
    await storeSession(page);
    await page.reload();
    await page.goto("/app/companies");
    await expect(page.locator("body")).toContainText(MOBILE_LONG_FIXTURE.companyName);

    await clearStoredSession(page);
    await page.reload();
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.locator("body")).not.toContainText(
      MOBILE_LONG_FIXTURE.companyName,
    );

    await page.goBack();
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.locator("body")).not.toContainText(
      MOBILE_LONG_FIXTURE.companyName,
    );
    expect(api.protectedRequestsWithoutAuthorization()).toEqual([]);
    runtime.assertClean();
  });
});

async function storeSession(page: Page) {
  await page.evaluate(() => {
    window.localStorage.setItem(
      "onehand.userWeb.accessToken",
      "e2e-user-web-access-token",
    );
    window.localStorage.setItem(
      "onehand.userWeb.accessTokenExpiresAt",
      "2026-12-31T23:59:59.000Z",
    );
  });
}

async function clearStoredSession(page: Page) {
  await page.evaluate(() => {
    window.localStorage.removeItem("onehand.userWeb.accessToken");
    window.localStorage.removeItem("onehand.userWeb.accessTokenExpiresAt");
  });
}

function collectRuntimeErrors(page: Page) {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];

  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });

  page.on("console", (message) => {
    if (message.type() !== "error") {
      return;
    }

    const text = message.text();

    if (text.includes("Failed to load resource")) {
      return;
    }

    consoleErrors.push(text);
  });

  return {
    assertClean() {
      expect({ consoleErrors, pageErrors }).toEqual({
        consoleErrors: [],
        pageErrors: [],
      });
    },
  };
}

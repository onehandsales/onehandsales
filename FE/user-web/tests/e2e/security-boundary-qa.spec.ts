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
    await page.goto("/app");
    await expect(page.getByTestId("app-home-empty")).toBeVisible();

    await clearStoredSession(page);
    await page.reload();
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.locator("body")).not.toContainText(
      MOBILE_LONG_FIXTURE.email,
    );

    await page.goBack();
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.locator("body")).not.toContainText(
      MOBILE_LONG_FIXTURE.email,
    );
    expect(api.protectedRequestsWithoutAuthorization()).toEqual([]);
    runtime.assertClean();
  });
});

// 기능 : store Session 기능을 수행합니다.
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

// 기능 : clear Stored Session 상태를 초기화합니다.
async function clearStoredSession(page: Page) {
  await page.evaluate(() => {
    window.localStorage.removeItem("onehand.userWeb.accessToken");
    window.localStorage.removeItem("onehand.userWeb.accessTokenExpiresAt");
  });
}

// 기능 : collect Runtime Errors 기능을 수행합니다.
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
    // 기능 : assert Clean 기능을 수행합니다.
    assertClean() {
      expect({ consoleErrors, pageErrors }).toEqual({
        consoleErrors: [],
        pageErrors: [],
      });
    },
  };
}

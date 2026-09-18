import { expect, test, type Page } from "@playwright/test";
import {
  MOBILE_LONG_FIXTURE,
  setupUserWebApiMocks,
} from "./support/user-web-api-mocks";

test.describe("G04 User Web security boundary QA", () => {
  test("does not show protected data after session removal and browser back", async ({
    page,
  }) => {
    // 1. 비동기 결과를 받아 api에 저장한다.
    const api = await setupUserWebApiMocks(page);
    // 2. 이후 단계에서 사용할 runtime 값을 준비한다.
    const runtime = collectRuntimeErrors(page);

    // 3. 필요한 비동기 작업을 실행한다.
    await page.goto("/login");
    // 4. 필요한 비동기 작업을 실행한다.
    await storeSession(page);
    // 5. 필요한 비동기 작업을 실행한다.
    await page.reload();
    // 6. 필요한 비동기 작업을 실행한다.
    await page.goto("/app");
    // 7. 필요한 비동기 작업을 실행한다.
    await expect(page).toHaveURL(/\/app\/workspaces\/workspace-e2e-001$/);
    // 8. 필요한 비동기 작업을 실행한다.
    await expect(page.getByTestId("app-home-empty")).toBeVisible();

    // 9. 필요한 비동기 작업을 실행한다.
    await clearStoredSession(page);
    // 10. 필요한 비동기 작업을 실행한다.
    await page.reload();
    // 11. 필요한 비동기 작업을 실행한다.
    await expect(page).toHaveURL(/\/login$/);
    // 12. 필요한 비동기 작업을 실행한다.
    await expect(page.locator("body")).not.toContainText(
      MOBILE_LONG_FIXTURE.email,
    );

    // 13. 필요한 비동기 작업을 실행한다.
    await page.goBack();
    // 14. 필요한 비동기 작업을 실행한다.
    await expect(page).toHaveURL(/\/login$/);
    // 15. 필요한 비동기 작업을 실행한다.
    await expect(page.locator("body")).not.toContainText(
      MOBILE_LONG_FIXTURE.email,
    );
    // 16. 테스트 기대 조건을 검증한다.
    expect(api.protectedRequestsWithoutAuthorization()).toEqual([]);
    // 17. 현재 단계에서 필요한 동작을 실행한다.
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
  // 1. 이후 단계에서 사용할 consoleErrors 값을 준비한다.
  const consoleErrors: string[] = [];
  // 2. 이후 단계에서 사용할 pageErrors 값을 준비한다.
  const pageErrors: string[] = [];

  // 3. 현재 단계에서 필요한 동작을 실행한다.
  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });

  // 4. 현재 단계에서 필요한 동작을 실행한다.
  page.on("console", (message) => {
    // 1. 조건을 확인해 필요한 분기 처리를 수행한다.
    if (message.type() !== "error") {
      return;
    }

    // 2. 이후 단계에서 사용할 text 값을 준비한다.
    const text = message.text();

    // 3. 조건을 확인해 필요한 분기 처리를 수행한다.
    if (text.includes("Failed to load resource")) {
      return;
    }

    // 4. 현재 단계에서 필요한 동작을 실행한다.
    consoleErrors.push(text);
  });

  // 5. 계산된 결과를 호출자에게 반환한다.
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

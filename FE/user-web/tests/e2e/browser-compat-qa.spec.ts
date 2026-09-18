import { expect, test, type Page } from "@playwright/test";
import {
  MOBILE_LONG_FIXTURE,
  seedAuthenticatedSession,
  setupUserWebApiMocks,
} from "./support/user-web-api-mocks";

test.describe("G03 Chrome/Edge desktop browser compatibility QA", () => {
  // 1. 화면 상태를 현재 흐름에 맞게 갱신한다.
  test("checks login entry and protected route redirect", async ({ page }) => {
    // 1. 비동기 결과를 받아 api에 저장한다.
    const api = await setupUserWebApiMocks(page);
    // 2. 이후 단계에서 사용할 runtime 값을 준비한다.
    const runtime = collectRuntimeErrors(page);

    // 3. 필요한 비동기 작업을 실행한다.
    await page.goto("/app");

    // 4. 필요한 비동기 작업을 실행한다.
    await expect(page).toHaveURL(/\/login$/);
    // 5. 필요한 비동기 작업을 실행한다.
    await expect(page.getByRole("button", { name: "Google" })).toBeVisible();
    // 6. 테스트 기대 조건을 검증한다.
    expect(api.protectedRequestsWithoutAuthorization()).toEqual([]);

    // 7. 필요한 비동기 작업을 실행한다.
    await page.goto("/en-us/login");
    // 8. 필요한 비동기 작업을 실행한다.
    await expect(page.getByRole("heading", { name: "Your AI workspace" })).toBeVisible();
    // 9. 필요한 비동기 작업을 실행한다.
    await expect(page.getByRole("button", { name: "Google" })).toBeVisible();

    // 10. 현재 단계에서 필요한 동작을 실행한다.
    runtime.assertClean();
  });

  // 2. 화면 상태를 현재 흐름에 맞게 갱신한다.
  test("loads the user workspace", async ({ page }) => {
    // 1. 비동기 결과를 받아 api에 저장한다.
    const api = await setupUserWebApiMocks(page);
    // 2. 이후 단계에서 사용할 runtime 값을 준비한다.
    const runtime = collectRuntimeErrors(page);
    // 3. 필요한 비동기 작업을 실행한다.
    await seedAuthenticatedSession(page);

    // 4. 필요한 비동기 작업을 실행한다.
    await page.goto("/app");
    // 5. 필요한 비동기 작업을 실행한다.
    await expect(page).toHaveURL(/\/app\/workspaces\/workspace-e2e-001$/);
    // 6. 필요한 비동기 작업을 실행한다.
    await expect(page.getByTestId("app-home-empty")).toBeVisible();

    // 7. 필요한 비동기 작업을 실행한다.
    await page.goto("/app/more");
    // 8. 필요한 비동기 작업을 실행한다.
    await expect(page.locator("body")).toContainText(MOBILE_LONG_FIXTURE.email);

    // 9. 테스트 기대 조건을 검증한다.
    expect(api.protectedRequestsWithoutAuthorization()).toEqual([]);
    // 10. 현재 단계에서 필요한 동작을 실행한다.
    runtime.assertClean();
  });

  // 3. 화면 상태를 현재 흐름에 맞게 갱신한다.
  test("keeps route state through reload and browser history", async ({ page }) => {
    // 1. 화면 상태를 현재 흐름에 맞게 갱신한다.
    await setupUserWebApiMocks(page);
    // 2. 이후 단계에서 사용할 runtime 값을 준비한다.
    const runtime = collectRuntimeErrors(page);
    // 3. 필요한 비동기 작업을 실행한다.
    await seedAuthenticatedSession(page);

    // 4. 필요한 비동기 작업을 실행한다.
    await page.goto("/app");
    // 5. 필요한 비동기 작업을 실행한다.
    await expect(page).toHaveURL(/\/app\/workspaces\/workspace-e2e-001$/);
    // 6. 필요한 비동기 작업을 실행한다.
    await expect(page.getByTestId("app-home-empty")).toBeVisible();

    // 7. 필요한 비동기 작업을 실행한다.
    await page.reload();
    // 8. 필요한 비동기 작업을 실행한다.
    await expect(page).toHaveURL(/\/app\/workspaces\/workspace-e2e-001$/);
    // 9. 필요한 비동기 작업을 실행한다.
    await expect(page.getByTestId("app-home-empty")).toBeVisible();

    // 10. 필요한 비동기 작업을 실행한다.
    await page.goto("/app/more");
    // 11. 필요한 비동기 작업을 실행한다.
    await expect(page).toHaveURL(/\/app\/more$/);
    // 12. 필요한 비동기 작업을 실행한다.
    await expect(page.locator("body")).toContainText(MOBILE_LONG_FIXTURE.email);

    // 13. 필요한 비동기 작업을 실행한다.
    await page.goBack();
    // 14. 필요한 비동기 작업을 실행한다.
    await expect(page).toHaveURL(/\/app\/workspaces\/workspace-e2e-001$/);
    // 15. 필요한 비동기 작업을 실행한다.
    await expect(page.getByTestId("app-home-empty")).toBeVisible();

    // 16. 필요한 비동기 작업을 실행한다.
    await page.goForward();
    // 17. 필요한 비동기 작업을 실행한다.
    await expect(page).toHaveURL(/\/app\/more$/);
    // 18. 필요한 비동기 작업을 실행한다.
    await expect(page.locator("body")).toContainText(MOBILE_LONG_FIXTURE.email);

    // 19. 현재 단계에서 필요한 동작을 실행한다.
    runtime.assertClean();
  });

  // 4. 화면 상태를 현재 흐름에 맞게 갱신한다.
  test("keeps the empty app home stable while profile API responses are delayed", async ({ page }) => {
    // 1. 화면 상태를 현재 흐름에 맞게 갱신한다.
    await setupUserWebApiMocks(page, {
      delayMs: (request) =>
        request.method === "GET" && request.pathname === "/api/users/me/profile" ? 1_200 : 0,
    });
    // 2. 이후 단계에서 사용할 runtime 값을 준비한다.
    const runtime = collectRuntimeErrors(page);
    // 3. 필요한 비동기 작업을 실행한다.
    await seedAuthenticatedSession(page);

    // 4. 필요한 비동기 작업을 실행한다.
    await page.goto("/app");
    // 5. 필요한 비동기 작업을 실행한다.
    await expect(page).toHaveURL(/\/app\/workspaces\/workspace-e2e-001$/);
    // 6. 필요한 비동기 작업을 실행한다.
    await expect(page.getByTestId("app-home-empty")).toBeVisible();
    // 7. 필요한 비동기 작업을 실행한다.
    await expect(page.locator(".animate-pulse")).toHaveCount(0);

    // 8. 현재 단계에서 필요한 동작을 실행한다.
    runtime.assertClean();
  });
});

// 기능 : collect Runtime Errors 기능을 수행합니다.
function collectRuntimeErrors(page: Page) {
  // 1. 이후 단계에서 사용할 pageErrors 값을 준비한다.
  const pageErrors: string[] = [];
  // 2. 이후 단계에서 사용할 consoleErrors 값을 준비한다.
  const consoleErrors: string[] = [];

  // 3. 현재 단계에서 필요한 동작을 실행한다.
  page.on("pageerror", (error) => pageErrors.push(error.message));
  // 4. 현재 단계에서 필요한 동작을 실행한다.
  page.on("console", (message) => {
    if (message.type() === "error" && !message.text().includes("favicon.ico")) {
      consoleErrors.push(message.text());
    }
  });

  // 5. 계산된 결과를 호출자에게 반환한다.
  return {
    // 기능 : assert Clean 기능을 수행합니다.
    assertClean() {
      expect({ consoleErrors, pageErrors }).toEqual({ consoleErrors: [], pageErrors: [] });
    },
  };
}

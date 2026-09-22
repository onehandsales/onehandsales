import { expect, test } from "@playwright/test";
import {
  MOBILE_LONG_FIXTURE,
  seedAuthenticatedSession,
  setupUserWebApiMocks,
} from "./support/user-web-api-mocks";

test.describe("User Web smoke E2E", () => {
  test("loads the core authenticated workspace", async ({ page }) => {
    // 1. 비동기 결과를 받아 api에 저장한다.
    const api = await setupUserWebApiMocks(page);
    // 2. 필요한 비동기 작업을 실행한다.
    await seedAuthenticatedSession(page);

    // 3. 필요한 비동기 작업을 실행한다.
    await page.goto("/app");
    // 4. 필요한 비동기 작업을 실행한다.
    await expect(page).toHaveURL(/\/app\/workspaces\/workspace-e2e-001$/);
    // 5. 필요한 비동기 작업을 실행한다.
    await expect(
      page.getByRole("main").getByTestId("app-home-empty"),
    ).toBeVisible();

    // 6. 필요한 비동기 작업을 실행한다.
    await page.goto("/app/more");
    // 7. 필요한 비동기 작업을 실행한다.
    await expect(page.locator("body")).toContainText(MOBILE_LONG_FIXTURE.email);

    // 8. 테스트 기대 조건을 검증한다.
    expect(api.protectedRequestsWithoutAuthorization()).toEqual([]);
  });
});

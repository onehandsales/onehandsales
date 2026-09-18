import { expect, test } from "@playwright/test";
import {
  seedAuthenticatedSession,
  setupUserWebApiMocks,
} from "./support/user-web-api-mocks";

test.describe("logout modal UX", () => {
  test("opens the logout confirm modal with the shared modal transition", async ({
    page,
  }) => {
    // 1. 비동기 결과를 받아 api에 저장한다.
    const api = await setupUserWebApiMocks(page);
    // 2. 필요한 비동기 작업을 실행한다.
    await seedAuthenticatedSession(page);

    // 3. 필요한 비동기 작업을 실행한다.
    await page.goto("/app");
    // 4. 필요한 비동기 작업을 실행한다.
    await expect(page).toHaveURL(/\/app\/workspaces\/workspace-e2e-001$/);
    // 5. 필요한 비동기 작업을 실행한다.
    await page.getByRole("button", { name: "E2E Workspace" }).click();
    // 6. 필요한 비동기 작업을 실행한다.
    await page.getByRole("menuitem", { exact: true, name: "로그아웃" }).click();

    // 7. 이후 단계에서 사용할 logoutDialog 값을 준비한다.
    const logoutDialog = page.getByRole("dialog");
    // 8. 필요한 비동기 작업을 실행한다.
    await expect(
      logoutDialog.getByRole("heading", {
        exact: true,
        name: "계정에서 로그아웃하시겠습니까?",
      }),
    ).toBeVisible();
    // 9. 필요한 비동기 작업을 실행한다.
    await expect(logoutDialog).toHaveClass(/transition-all/);
    // 10. 필요한 비동기 작업을 실행한다.
    await expect(logoutDialog).toHaveClass(/duration-300/);

    // 11. 필요한 비동기 작업을 실행한다.
    await logoutDialog.getByRole("button", { exact: true, name: "취소" }).click();
    // 12. 필요한 비동기 작업을 실행한다.
    await expect(logoutDialog).toBeHidden();
    // 13. 테스트 기대 조건을 검증한다.
    expect(api.protectedRequestsWithoutAuthorization()).toEqual([]);
  });
});

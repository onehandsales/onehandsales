import { expect, test } from "@playwright/test";
import {
  seedAuthenticatedSession,
  setupUserWebApiMocks,
} from "./support/user-web-api-mocks";

test.describe("create workspace modal UX", () => {
  test("opens the workspace creation wizard from the sidebar account menu", async ({
    page,
  }) => {
    // 1. 비동기 결과를 받아 api에 저장한다.
    const api = await setupUserWebApiMocks(page);
    // 2. 필요한 비동기 작업을 실행한다.
    await seedAuthenticatedSession(page);

    // 3. 필요한 비동기 작업을 실행한다.
    await page.goto("/app");
    // 4. 필요한 비동기 작업을 실행한다.
    await page.getByRole("button", { name: "E2E Workspace" }).click();
    // 5. 필요한 비동기 작업을 실행한다.
    await page.getByRole("menuitem", { exact: true, name: "새 작업 공간" }).click();

    // 6. 이후 단계에서 사용할 createWorkspaceDialog 값을 준비한다.
    const createWorkspaceDialog = page.getByRole("dialog").first();
    // 7. 필요한 비동기 작업을 실행한다.
    await expect(createWorkspaceDialog).toBeVisible();
    // 8. 필요한 비동기 작업을 실행한다.
    await expect(createWorkspaceDialog.getByText("1 / 2")).toBeVisible();
    // 9. 필요한 비동기 작업을 실행한다.
    await expect(
      createWorkspaceDialog.getByRole("heading", {
        exact: true,
        name: "새 작업 공간 이름을 작성해 주세요.",
      }),
    ).toBeVisible();

    // 10. 이후 단계에서 사용할 nextButton 값을 준비한다.
    const nextButton = createWorkspaceDialog.getByRole("button", {
      exact: true,
      name: "다음",
    });
    // 11. 필요한 비동기 작업을 실행한다.
    await expect(nextButton).toBeDisabled();
    // 12. 필요한 비동기 작업을 실행한다.
    await expect(nextButton).toHaveCSS("background-color", "rgb(72, 128, 238)");

    // 13. 필요한 비동기 작업을 실행한다.
    await createWorkspaceDialog
      .getByLabel("작업 공간 이름")
      .fill("부동산 매물 관리");
    // 14. 필요한 비동기 작업을 실행한다.
    await expect(nextButton).toBeEnabled();
    // 15. 필요한 비동기 작업을 실행한다.
    await nextButton.click();

    // 16. 필요한 비동기 작업을 실행한다.
    await expect(
      createWorkspaceDialog.getByRole("heading", {
        exact: true,
        name: "어떤 일을 위한 공간인가요?",
      }),
    ).toBeVisible();
    await expect(createWorkspaceDialog.getByText("2 / 2")).toBeVisible();
    // 17. 필요한 비동기 작업을 실행한다.
    await expect(createWorkspaceDialog.getByText("부동산 매물 관리")).toBeVisible();
    // 18. 필요한 비동기 작업을 실행한다.
    await createWorkspaceDialog
      .getByRole("button", { name: /부동산$/ })
      .click();
    // 19. 필요한 비동기 작업을 실행한다.
    await expect(
      createWorkspaceDialog.getByRole("button", {
        name: /부동산$/,
      }),
    ).toHaveAttribute("aria-pressed", "true");

    // 20. 테스트 기대 조건을 검증한다.
    expect(api.protectedRequestsWithoutAuthorization()).toEqual([]);
  });
});

import { expect, test } from "@playwright/test";
import {
  seedAuthenticatedSession,
  setupUserWebApiMocks,
} from "./support/user-web-api-mocks";

test.describe("G01 account settings modal baseline", () => {
  test("opens Settings from the query contract and keeps Profile visible", async ({
    page,
  }) => {
    // 1. 비동기 결과를 받아 api에 저장한다.
    const api = await setupUserWebApiMocks(page);
    // 2. 필요한 비동기 작업을 실행한다.
    await seedAuthenticatedSession(page);

    // 3. 필요한 비동기 작업을 실행한다.
    await page.goto("/app?account=settings");

    // 4. 이후 단계에서 사용할 accountDialog 값을 준비한다.
    const accountDialog = page.getByRole("dialog").first();
    // 5. 필요한 비동기 작업을 실행한다.
    await expect(page).toHaveURL(
      /\/app\/workspaces\/workspace-e2e-001\?account=settings$/,
    );
    // 6. 필요한 비동기 작업을 실행한다.
    await expect(accountDialog.getByText("지역 설정")).toBeVisible();
    // 7. 필요한 비동기 작업을 실행한다.
    await expect(accountDialog.getByText("로그인 메타데이터")).toHaveCount(0);
    // 8. 필요한 비동기 작업을 실행한다.
    await expect(
      accountDialog.getByRole("button", { exact: true, name: "이용약관" }),
    ).toHaveCount(0);
    // 9. 필요한 비동기 작업을 실행한다.
    await expect(
      accountDialog.getByRole("button", { exact: true, name: "개인정보" }),
    ).toHaveCount(0);
    // 10. 필요한 비동기 작업을 실행한다.
    await expect(accountDialog).toHaveClass(/transition-all/);
    // 11. 필요한 비동기 작업을 실행한다.
    await expect(accountDialog).toHaveClass(/duration-300/);

    // 12. 필요한 비동기 작업을 실행한다.
    await accountDialog.getByLabel("기본 국가").selectOption("US");
    // 13. 필요한 비동기 작업을 실행한다.
    await accountDialog.getByLabel("기본 통화").selectOption("USD");

    // 14. 이후 단계에서 사용할 profilePatchRequest 값을 준비한다.
    const profilePatchRequest = page.waitForRequest((request) => {
      const url = new URL(request.url());

      return (
        request.method() === "PATCH" &&
        url.pathname === "/api/users/me/profile"
      );
    });
    // 15. 필요한 비동기 작업을 실행한다.
    await accountDialog.getByRole("button", { name: "저장" }).click();
    // 16. 필요한 비동기 작업을 실행한다.
    await expect(accountDialog.getByText("개인 정보를 저장했어요.")).toBeVisible();
    // 17. 필요한 비동기 작업을 실행한다.
    expect((await profilePatchRequest).postDataJSON()).toEqual({
      countryCode: "US",
      defaultCurrencyCode: "USD",
      preferredLocale: "ko-KR",
      timeZone: "Asia/Seoul",
    });

    // 18. 필요한 비동기 작업을 실행한다.
    await accountDialog.getByRole("button", { name: "닫기" }).click();
    // 19. 필요한 비동기 작업을 실행한다.
    await expect(accountDialog).toBeHidden();
    // 20. 필요한 비동기 작업을 실행한다.
    await expect(page).not.toHaveURL(/account=settings/);

    // 21. 필요한 비동기 작업을 실행한다.
    await page.getByRole("button", { name: "모바일QA사용자" }).click();
    // 22. 필요한 비동기 작업을 실행한다.
    await page.getByRole("menuitem", { name: "설정" }).click();

    // 23. 이후 단계에서 사용할 reopenedDialog 값을 준비한다.
    const reopenedDialog = page.getByRole("dialog").first();
    // 24. 필요한 비동기 작업을 실행한다.
    await expect(page).toHaveURL(/account=settings/);

    // 25. 필요한 비동기 작업을 실행한다.
    await reopenedDialog.getByRole("button", { name: "모바일QA사용자" }).click();
    // 26. 필요한 비동기 작업을 실행한다.
    await expect(page).not.toHaveURL(/account=settings/);
    // 27. 필요한 비동기 작업을 실행한다.
    await expect(
      reopenedDialog.getByRole("heading", { name: "계정 정보" }),
    ).toBeVisible();
    // 28. 필요한 비동기 작업을 실행한다.
    await expect(
      reopenedDialog.getByRole("heading", { name: "계정 상태" }),
    ).toBeVisible();
    // 29. 필요한 비동기 작업을 실행한다.
    await expect(
      reopenedDialog.getByRole("heading", { name: "로그인 방식" }),
    ).toBeVisible();

    // 30. 테스트 기대 조건을 검증한다.
    expect(api.protectedRequestsWithoutAuthorization()).toEqual([]);
  });
});

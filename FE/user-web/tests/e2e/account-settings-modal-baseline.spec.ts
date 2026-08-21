import { expect, test } from "@playwright/test";
import {
  seedAuthenticatedSession,
  setupUserWebApiMocks,
} from "./support/user-web-api-mocks";

test.describe("G01 account settings modal baseline", () => {
  test("opens Settings from the query contract and keeps Profile/Notifications separated", async ({
    page,
  }) => {
    const api = await setupUserWebApiMocks(page);
    await seedAuthenticatedSession(page);

    await page.goto("/app?account=settings");

    const accountDialog = page.getByRole("dialog").first();
    await expect(
      accountDialog.getByRole("heading", { exact: true, name: "설정" }),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/app\?account=settings$/);
    await expect(accountDialog.getByText("지역 설정")).toBeVisible();
    await expect(accountDialog.getByText("로그인 메타데이터")).toHaveCount(0);

    await accountDialog.getByLabel("기본 국가").selectOption("US");
    await accountDialog.getByLabel("기본 통화").selectOption("USD");

    const profilePatchRequest = page.waitForRequest((request) => {
      const url = new URL(request.url());

      return (
        request.method() === "PATCH" &&
        url.pathname === "/api/users/me/profile"
      );
    });
    await accountDialog.getByRole("button", { name: "저장" }).click();
    await expect(accountDialog.getByText("개인 정보를 저장했어요.")).toBeVisible();
    expect((await profilePatchRequest).postDataJSON()).toEqual({
      countryCode: "US",
      defaultCurrencyCode: "USD",
      preferredLocale: "ko-KR",
      timeZone: "Asia/Seoul",
    });

    await accountDialog.getByRole("button", { name: "닫기" }).click();
    await expect(accountDialog).toBeHidden();
    await expect(page).not.toHaveURL(/account=settings/);

    await page.getByRole("button", { name: "모바일QA사용자" }).click();
    await page.getByRole("menuitem", { name: "설정" }).click();

    const reopenedDialog = page.getByRole("dialog").first();
    await expect(
      reopenedDialog.getByRole("heading", { exact: true, name: "설정" }),
    ).toBeVisible();
    await expect(page).toHaveURL(/account=settings/);

    await reopenedDialog.getByRole("button", { name: "모바일QA사용자" }).click();
    await expect(page).not.toHaveURL(/account=settings/);
    await expect(
      reopenedDialog.getByRole("heading", { name: "프로필 설정" }),
    ).toBeVisible();
    await expect(reopenedDialog.getByText("계정 정보")).toBeVisible();
    await expect(reopenedDialog.getByText("연결 provider")).toBeVisible();
    await expect(reopenedDialog.getByText("등록 기기")).toBeVisible();

    await reopenedDialog.getByRole("button", { name: "알림" }).click();
    await expect(
      reopenedDialog.getByRole("heading", { exact: true, name: "알림" }),
    ).toBeVisible();
    await expect(
      reopenedDialog.getByText("Onehand가 생성하고 발송할 서비스 reminder를 선택해요."),
    ).toBeVisible();
    expect(api.protectedRequestsWithoutAuthorization()).toEqual([]);
  });
});

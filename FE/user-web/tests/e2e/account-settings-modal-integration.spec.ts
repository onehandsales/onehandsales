import { expect, test, type Locator } from "@playwright/test";
import {
  seedAuthenticatedSession,
  setupUserWebApiMocks,
} from "./support/user-web-api-mocks";

test.describe("G02 account settings modal integration", () => {
  test("renders account data requests inside Settings modal and keeps Notifications intact", async ({
    page,
  }) => {
    await setupUserWebApiMocks(page);
    await seedAuthenticatedSession(page);

    let dataExportDetailRequestCount = 0;
    page.on("request", (request) => {
      const url = new URL(request.url());

      if (
        request.method() === "GET" &&
        /^\/api\/users\/me\/data-export-requests\/[^/]+$/.test(url.pathname)
      ) {
        dataExportDetailRequestCount += 1;
      }
    });

    await page.goto("/app?account=settings");

    const accountDialog = page.getByRole("dialog").first();
    await expect(
      accountDialog.getByRole("heading", { exact: true, name: "설정" }),
    ).toBeVisible();
    await expect(
      accountDialog.getByRole("button", { exact: true, name: "설정" }),
    ).toHaveClass(/bg-\[#E4E2DC\]/);
    await expect(accountDialog.getByText("지역 설정")).toBeVisible();

    const accountDataSection = accountDialog
      .getByRole("heading", { name: "계정 데이터 요청" })
      .locator("xpath=ancestor::section[1]");
    await expect(
      accountDataSection.getByRole("heading", {
        exact: true,
        name: "내 데이터 export",
      }),
    ).toBeVisible();
    await expect(
      accountDataSection.getByRole("heading", {
        exact: true,
        name: "계정 삭제 요청",
      }),
    ).toBeVisible();
    await expectNoHorizontalOverflow(accountDataSection);

    const dataExportPostRequest = page.waitForRequest((request) => {
      const url = new URL(request.url());

      return (
        request.method() === "POST" &&
        url.pathname === "/api/users/me/data-export-requests"
      );
    });
    await accountDataSection.getByRole("button", { exact: true, name: "요청" }).click();
    expect((await dataExportPostRequest).postDataJSON()).toEqual({
      format: "ZIP_JSON_XLSX",
      includeSensitive: false,
    });
    await expect(
      accountDialog.getByText("데이터 export 요청을 접수했어요."),
    ).toBeVisible();
    await expect(
      accountDataSection.getByText(/data-export-request-mobile-001/),
    ).toBeVisible();

    const refreshButton = accountDataSection.getByRole("button", {
      name: "새로고침",
    });
    await expect(refreshButton).toBeEnabled();
    const previousDetailRequestCount = dataExportDetailRequestCount;
    await refreshButton.click();
    await expect
      .poll(() => dataExportDetailRequestCount)
      .toBeGreaterThan(previousDetailRequestCount);
    await expect(
      accountDialog.getByText("데이터 export 요청 상태를 새로고침했어요."),
    ).toBeVisible();

    const deleteRequestButton = accountDataSection.getByRole("button", {
      exact: true,
      name: "삭제 요청",
    });
    await expect(deleteRequestButton).toBeDisabled();
    await accountDataSection.getByLabel("확인 문구").fill("DELETE MY ACCOUNT");
    await accountDataSection.getByLabel("사유").selectOption("PRIVACY_CONCERN");
    await accountDataSection.getByLabel("메모").fill("modal migration smoke");
    await expect(deleteRequestButton).toBeEnabled();

    const accountDeletionPostRequest = page.waitForRequest((request) => {
      const url = new URL(request.url());

      return (
        request.method() === "POST" &&
        url.pathname === "/api/users/me/account-deletion-requests"
      );
    });
    await deleteRequestButton.click();
    expect((await accountDeletionPostRequest).postDataJSON()).toEqual({
      confirmText: "DELETE MY ACCOUNT",
      reasonCode: "PRIVACY_CONCERN",
      reasonMessage: "modal migration smoke",
    });
    await expect(
      accountDialog.getByText("계정 삭제 요청을 접수했어요."),
    ).toBeVisible();
    await expect(
      accountDataSection.getByText(/account-deletion-request-mobile-001/),
    ).toBeVisible();

    const cancelRequest = page.waitForRequest((request) => {
      const url = new URL(request.url());

      return (
        request.method() === "POST" &&
        /^\/api\/users\/me\/account-deletion-requests\/[^/]+\/cancel$/.test(
          url.pathname,
        )
      );
    });
    const cancelButton = accountDataSection.getByRole("button", {
      name: "삭제 요청 취소",
    });
    await expect(cancelButton).toBeEnabled();
    await cancelButton.click();
    await cancelRequest;
    await expect(
      accountDialog.getByText("계정 삭제 요청을 취소했어요."),
    ).toBeVisible();
    await expect(accountDataSection.getByText("CANCELLED")).toBeVisible();
    await expect(cancelButton).toBeDisabled();
    await expectNoHorizontalOverflow(accountDataSection);

    await accountDialog.getByRole("button", { name: "알림" }).click();
    await expect(
      accountDialog.getByRole("heading", { exact: true, name: "알림" }),
    ).toBeVisible();
    await expect(
      accountDialog.getByText("OneHand가 생성하고 발송할 서비스 reminder를 선택해요."),
    ).toBeVisible();

    await accountDialog.getByRole("button", { name: "닫기" }).click();
    await expect(page).toHaveURL(/\/app$/);
  });
});

// 기능 : 지정한 UI 영역이 가로 overflow 없이 부모 폭 안에 들어오는지 검증합니다.
async function expectNoHorizontalOverflow(locator: Locator) {
  const size = await locator.evaluate((node) => ({
    clientWidth: node.clientWidth,
    scrollWidth: node.scrollWidth,
  }));

  expect(size.scrollWidth).toBeLessThanOrEqual(size.clientWidth + 1);
}

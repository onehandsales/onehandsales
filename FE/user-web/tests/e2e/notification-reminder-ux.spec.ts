import { expect, test } from "@playwright/test";
import {
  seedAuthenticatedSession,
  setupUserWebApiMocks,
} from "./support/user-web-api-mocks";

test.describe("G05 notification reminder UX QA", () => {
  test("reads a notification, updates unread badge, and persists settings", async ({
    page,
  }) => {
    const api = await setupUserWebApiMocks(page);
    await seedAuthenticatedSession(page);

    await page.goto("/app/notifications");

    await expect(
      page.getByRole("heading", { exact: true, name: "알림" }),
    ).toBeVisible();
    await expect(page.getByText("안읽음 1개").first()).toBeVisible();
    await expect(
      page.getByRole("link", { name: /알림, 안읽음 1개/ }).first(),
    ).toBeVisible();

    const notificationRow = page
      .locator("article")
      .filter({ hasText: "딜 마감 reminder" });
    await notificationRow.getByRole("button", { name: "읽음" }).click();

    await expect(page.getByText("안읽음 0개").first()).toBeVisible();
    await expect(
      page.getByRole("link", { exact: true, name: "알림" }).first(),
    ).toBeVisible();

    await page
      .locator("label")
      .filter({ hasText: "브라우저 푸시" })
      .getByRole("checkbox")
      .check();
    await page.getByRole("button", { name: "저장" }).click();
    await expect(page.getByText("알림 설정을 저장했어요.")).toBeVisible();

    await page.reload();
    await expect(
      page
        .locator("label")
        .filter({ hasText: "브라우저 푸시" })
        .getByRole("checkbox"),
    ).toBeChecked();

    expect(api.protectedRequestsWithoutAuthorization()).toEqual([]);
  });

  test("shows a safe browser push fallback when notification permission is denied", async ({
    page,
  }) => {
    const api = await setupUserWebApiMocks(page);
    await page.addInitScript(() => {
      if (!window.Notification) {
        return;
      }

      Object.defineProperty(window.Notification, "permission", {
        configurable: true,
        get: () => "denied",
      });
      Object.defineProperty(window.Notification, "requestPermission", {
        configurable: true,
        value: async () => "denied",
      });
    });
    await seedAuthenticatedSession(page);

    await page.goto("/app/notifications");
    await page
      .locator("label")
      .filter({ hasText: "브라우저 푸시" })
      .getByRole("checkbox")
      .check();

    await expect(page.getByText("차단", { exact: true }).first()).toBeVisible();
    await expect(
      page.getByText("브라우저 설정에서 알림 권한 차단을 해제"),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "권한 요청" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "구독 등록" })).toBeDisabled();

    expect(api.protectedRequestsWithoutAuthorization()).toEqual([]);
  });

  test("shows a safe browser push fallback when push APIs are unsupported", async ({
    page,
  }) => {
    const api = await setupUserWebApiMocks(page);
    await page.addInitScript(() => {
      Object.defineProperty(window, "Notification", {
        configurable: true,
        value: undefined,
      });
      Object.defineProperty(window, "PushManager", {
        configurable: true,
        value: undefined,
      });
      Object.defineProperty(navigator, "serviceWorker", {
        configurable: true,
        value: undefined,
      });
    });
    await seedAuthenticatedSession(page);

    await page.goto("/app/notifications");
    await page
      .locator("label")
      .filter({ hasText: "브라우저 푸시" })
      .getByRole("checkbox")
      .check();

    await expect(page.getByText("미지원", { exact: true }).first()).toBeVisible();
    await expect(
      page.getByText("이 브라우저에서는 푸시 알림을 사용할 수 없어요."),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "권한 요청" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "구독 등록" })).toBeDisabled();

    expect(api.protectedRequestsWithoutAuthorization()).toEqual([]);
  });
});

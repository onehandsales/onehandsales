import { expect, test, type Page } from "@playwright/test";
import {
  seedAuthenticatedSession,
  setupUserWebApiMocks,
} from "./support/user-web-api-mocks";

test.describe("G04 Google Calendar UX", () => {
  test("shows calendar status, hidden filter, source badge, and manual sync on schedules", async ({
    page,
  }) => {
    const api = await setupUserWebApiMocks(page);
    await seedAuthenticatedSession(page);

    await page.goto("/app/schedules?googleCalendar=connected");

    await expect(
      page.getByText("Google Calendar가 연결됐어요.").first(),
    ).toBeVisible();
    await expect(page.getByText("연결됨").first()).toBeVisible();
    await expect(page.getByText("Google").first()).toBeVisible();
    await expect(page.getByLabel("meet.google.com 열기").first()).toBeVisible();

    await page
      .getByRole("button", { name: /RQA002 모바일 일정.*일정 열기/ })
      .click({ position: { x: 8, y: 8 } });
    const scheduleDialog = page.getByRole("dialog").filter({
      hasText: "일정 수정",
    });
    await expect(scheduleDialog).toBeVisible();
    await scheduleDialog.getByLabel("닫기").click();

    const hiddenFilterRequest = page.waitForRequest((request) => {
      const url = new URL(request.url());
      return (
        request.method() === "GET" &&
        url.pathname === "/api/schedules" &&
        url.searchParams.get("visibility") === "HIDDEN_GOOGLE"
      );
    });
    await page.getByRole("button", { name: "숨긴 Google 일정" }).click();
    await hiddenFilterRequest;

    const syncRequest = page.waitForRequest((request) => {
      const url = new URL(request.url());
      return (
        request.method() === "POST" &&
        url.pathname === "/api/schedules/google/sync"
      );
    });
    await page.getByRole("button", { name: "동기화" }).click();
    await syncRequest;
    await expect(page.getByRole("button", { name: "동기화" })).toBeDisabled();

    expect(api.protectedRequestsWithoutAuthorization()).toEqual([]);
  });

  test("manages calendar selection and disconnect action on settings", async ({
    page,
  }) => {
    const api = await setupUserWebApiMocks(page);
    await seedAuthenticatedSession(page);

    await page.goto("/app/settings?googleCalendar=connected");

    await expect(
      page.getByText("Google Calendar가 연결됐어요.").first(),
    ).toBeVisible();
    await page.getByRole("button", { exact: true, name: "닫기" }).click();
    await expect(page.getByText("mobile-qa@example.test").first()).toBeVisible();
    await expect(page.getByText("1/2개").first()).toBeVisible();

    await page.getByRole("button", { name: "캘린더 선택" }).click();
    const calendarDialog = page.getByRole("dialog", { name: "캘린더 선택" });
    await expect(calendarDialog).toBeVisible();
    await expect(calendarDialog.getByText("기본", { exact: true })).toBeVisible();
    await expect(
      calendarDialog.getByText("시스템", { exact: true }),
    ).toBeVisible();
    await expect(
      calendarDialog.getByRole("checkbox").first(),
    ).toBeChecked();

    const selectionRequest = page.waitForRequest((request) => {
      const url = new URL(request.url());
      return (
        request.method() === "PATCH" &&
        url.pathname === "/api/schedules/google/calendars"
      );
    });
    await calendarDialog.getByRole("button", { name: "저장" }).click();
    const request = await selectionRequest;
    expect(request.postDataJSON()).toEqual({
      selectedCalendarIds: ["primary"],
    });
    await page.getByRole("button", { exact: true, name: "닫기" }).click();

    await page.getByRole("button", { name: "연결 해제" }).click();
    const disconnectDialog = page.getByRole("dialog", { name: "연결 해제" });
    await expect(disconnectDialog).toBeVisible();
    await expect(disconnectDialog.getByLabel("일정 유지")).toBeChecked();

    const disconnectRequest = page.waitForRequest((request) => {
      const url = new URL(request.url());
      return (
        request.method() === "POST" &&
        url.pathname === "/api/schedules/google/disconnect"
      );
    });
    await disconnectDialog
      .getByRole("button", { name: "연결 해제" })
      .click();
    const disconnectPayload = (await disconnectRequest).postDataJSON();
    expect(disconnectPayload).toEqual({ scheduleAction: "KEEP" });

    expect(api.protectedRequestsWithoutAuthorization()).toEqual([]);
  });

  test.describe("mobile layout", () => {
    test.use({
      hasTouch: true,
      isMobile: true,
      viewport: { width: 390, height: 844 },
    });

    test("keeps schedules, settings, and calendar modal within viewport", async ({
      page,
    }) => {
      await setupUserWebApiMocks(page);
      await seedAuthenticatedSession(page);

      const scheduleStatusResponse = page.waitForResponse((response) => {
        const url = new URL(response.url());
        return url.pathname === "/api/schedules/google/status";
      });
      await page.goto("/app/schedules");
      await scheduleStatusResponse;
      await expectNoDocumentHorizontalOverflow(page);

      const settingsStatusResponse = page.waitForResponse((response) => {
        const url = new URL(response.url());
        return url.pathname === "/api/schedules/google/status";
      });
      await page.goto("/app/settings");
      await settingsStatusResponse;
      await expectNoDocumentHorizontalOverflow(page);

      await page.getByRole("button", { name: "캘린더 선택" }).last().click();
      await expect(
        page.getByRole("dialog", { name: "캘린더 선택" }),
      ).toBeVisible();
      await expectNoDocumentHorizontalOverflow(page);
    });
  });
});

async function expectNoDocumentHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );

  expect(overflow).toBeLessThanOrEqual(1);
}

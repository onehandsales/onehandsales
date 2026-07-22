import { expect, test } from "@playwright/test";
import {
  seedAuthenticatedSession,
  setupUserWebApiMocks,
} from "./support/user-web-api-mocks";

test.describe("G03 weekly schedule report UX", () => {
  test("opens the report route, updates week query, and downloads xlsx with current params", async ({
    page,
  }) => {
    const api = await setupUserWebApiMocks(page, {
      delayMs: (request) =>
        request.pathname === "/api/schedules/week" ||
        request.pathname === "/api/schedules/week/export/xlsx"
          ? 250
          : 0,
    });
    await seedAuthenticatedSession(page);

    await page.goto("/app/schedules");
    await page.getByRole("link", { name: "주간 보고서" }).click();
    await expect(page).toHaveURL(/\/app\/schedules\/week\?weekStart=/);

    await page.goto("/schedules/week?weekStart=2026-07-20");
    await expect(page).toHaveURL(
      /\/app\/schedules\/week\?weekStart=2026-07-20$/,
    );
    await expect(
      page.getByText("주간 보고서를 불러오고 있어요.").first(),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { exact: true, name: "주간 보고서" }),
    ).toBeVisible();
    await expect(page.locator("body")).toContainText("RQA002");

    const nextWeekRequest = page.waitForRequest((request) => {
      const url = new URL(request.url());
      return (
        request.method() === "GET" &&
        url.pathname === "/api/schedules/week" &&
        url.searchParams.get("weekStart") === "2026-07-27"
      );
    });
    await page.getByRole("button", { name: "다음 주" }).click();
    await nextWeekRequest;
    await expect(page).toHaveURL(/weekStart=2026-07-27/);
    await expect(
      page.getByText("일정을 등록하면 이번 주 계획을 한눈에 볼 수 있어요.").first(),
    ).toBeVisible();

    await page.getByRole("button", { name: "이전 주" }).click();
    await expect(page).toHaveURL(/weekStart=2026-07-20/);
    await expect(page.locator("body")).toContainText("RQA002");

    const exportRequest = page.waitForRequest((request) => {
      const url = new URL(request.url());
      return (
        request.method() === "GET" &&
        url.pathname === "/api/schedules/week/export/xlsx"
      );
    });
    const download = page.waitForEvent("download");
    const downloadButton = page.getByRole("button", { name: "엑셀 다운로드" });

    await downloadButton.click();
    await expect(downloadButton).toBeDisabled();

    const request = await exportRequest;
    const requestUrl = new URL(request.url());
    expect(requestUrl.searchParams.get("weekStart")).toBe("2026-07-20");
    expect(requestUrl.searchParams.get("timeZone")).toBe("Asia/Seoul");

    const downloadedFile = await download;
    expect(downloadedFile.suggestedFilename()).toMatch(
      /^weekly_schedules_\d{8}_\d{6}\.xlsx$/,
    );
    await expect(downloadButton).toBeEnabled();

    expect(api.protectedRequestsWithoutAuthorization()).toEqual([]);
  });
});

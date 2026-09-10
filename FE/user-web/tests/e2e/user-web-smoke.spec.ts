import { expect, test } from "@playwright/test";
import {
  MOBILE_LONG_FIXTURE,
  seedAuthenticatedSession,
  setupUserWebApiMocks,
} from "./support/user-web-api-mocks";

test.describe("User Web smoke E2E", () => {
  test("loads the core authenticated sales workspace", async ({ page }) => {
    const api = await setupUserWebApiMocks(page);
    await seedAuthenticatedSession(page);

    await page.goto("/app");
    await expect(page.locator("body")).toContainText("딜 현황");

    await page.goto("/app/companies");
    await expect(page.locator("body")).toContainText(MOBILE_LONG_FIXTURE.companyName);

    await page.goto("/app/contacts");
    await expect(page.locator("body")).toContainText(MOBILE_LONG_FIXTURE.contactName);

    await page.goto("/app/products");
    await expect(page.locator("body")).toContainText(MOBILE_LONG_FIXTURE.url);

    await page.goto("/app/deals");
    await expect(page.locator("body")).toContainText("RQA002 모바일 브라우저 긴 딜명");
    await expect(page.locator("body")).toContainText("초기 상담을 기록했어요.");

    expect(api.protectedRequestsWithoutAuthorization()).toEqual([]);
  });
});

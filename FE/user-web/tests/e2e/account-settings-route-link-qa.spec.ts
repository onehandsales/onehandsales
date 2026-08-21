import { expect, test } from "@playwright/test";
import {
  seedAuthenticatedSession,
  setupUserWebApiMocks,
} from "./support/user-web-api-mocks";

test.describe("G03 account settings route link QA", () => {
  test("bridges direct and legacy settings routes to the account settings modal", async ({
    page,
  }) => {
    const api = await setupUserWebApiMocks(page);
    await seedAuthenticatedSession(page);

    await page.goto("/app/settings");
    await expect(page).toHaveURL(/\/app\?account=settings$/);
    await expect(page.getByRole("dialog").first()).toBeVisible();

    await page.goto("/settings");
    await expect(page).toHaveURL(/\/app\?account=settings$/);
    await expect(page.getByRole("dialog").first()).toBeVisible();

    await page.goto("/app/settings?googleCalendar=connected");
    await expect(page).toHaveURL(/\/app\/schedules\?account=settings$/);
    await expect(page.getByRole("dialog").first()).toBeVisible();
    await expect(page.locator("body")).toContainText("Google Calendar");

    expect(api.protectedRequestsWithoutAuthorization()).toEqual([]);
  });

  test("uses modal-open links from More and schedules while notification bell stays separate", async ({
    page,
  }) => {
    const api = await setupUserWebApiMocks(page);
    await seedAuthenticatedSession(page);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/app/more");

    const moreSettingsLink = page.locator(
      'a[href="/app/more?account=settings"]:visible'
    );
    await expect(moreSettingsLink.first()).toBeVisible();
    await moreSettingsLink.first().click();
    await expect(page).toHaveURL(/\/app\/more\?account=settings$/);
    await expect(page.getByRole("dialog").first()).toBeVisible();

    await page.goto("/app/schedules");
    const scheduleSettingsLink = page.locator(
      'a[href="/app/schedules?account=settings"]:visible'
    );
    await expect(scheduleSettingsLink.first()).toBeVisible();
    await scheduleSettingsLink.first().click();
    await expect(page).toHaveURL(/\/app\/schedules\?account=settings$/);
    await expect(page.getByRole("dialog").first()).toBeVisible();

    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/app");
    await page.locator('a[href="/app/notifications"]:visible').first().click();
    await expect(page).toHaveURL(/\/app\/notifications$/);

    expect(api.protectedRequestsWithoutAuthorization()).toEqual([]);
  });
});

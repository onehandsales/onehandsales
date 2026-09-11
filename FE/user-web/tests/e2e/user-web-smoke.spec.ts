import { expect, test } from "@playwright/test";
import {
  MOBILE_LONG_FIXTURE,
  seedAuthenticatedSession,
  setupUserWebApiMocks,
} from "./support/user-web-api-mocks";

test.describe("User Web smoke E2E", () => {
  test("loads the core authenticated workspace", async ({ page }) => {
    const api = await setupUserWebApiMocks(page);
    await seedAuthenticatedSession(page);

    await page.goto("/app");
    await expect(page.getByTestId("app-home-empty")).toBeVisible();

    await page.goto("/app/more");
    await expect(page.locator("body")).toContainText(MOBILE_LONG_FIXTURE.email);

    expect(api.protectedRequestsWithoutAuthorization()).toEqual([]);
  });
});

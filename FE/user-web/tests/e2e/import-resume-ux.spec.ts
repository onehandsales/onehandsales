import { expect, test } from "@playwright/test";
import {
  seedAuthenticatedSession,
  setupUserWebApiMocks,
} from "./support/user-web-api-mocks";

test.describe("G03 import resume UX", () => {
  test("resumes an active import, saves row edits, and confirms", async ({
    page,
  }) => {
    const api = await setupUserWebApiMocks(page);
    await seedAuthenticatedSession(page);

    await page.goto("/app/import");
    const activeJobCard = page
      .getByTestId("active-import-job-import-job-mobile-001")
      .first();
    await expect(
      activeJobCard,
    ).toBeVisible();

    await activeJobCard.click();
    await expect(page).toHaveURL(/\/app\/import\/review\/import-job-mobile-001$/);

    const primaryAction = page.getByTestId("import-review-primary-action").first();
    await page
      .getByTestId("import-row-import-job-row-mobile-001-field-companyName-desktop")
      .first()
      .fill("Onehand Resume Company");
    await expect(primaryAction).toHaveText(
      /수정 저장/,
    );

    await primaryAction.click();
    await expect(primaryAction).toHaveText(
      /가져오기/,
    );

    await primaryAction.click();
    await expect(page).toHaveURL(/\/app\/import\/import-user-log-mobile-001$/);
    expect(api.protectedRequestsWithoutAuthorization()).toEqual([]);
  });

  test("uploads a new file and opens the import review route", async ({ page }) => {
    const api = await setupUserWebApiMocks(page);
    await seedAuthenticatedSession(page);

    await page.goto("/app/import");
    await page.getByTestId("import-file-input").first().setInputFiles({
      buffer: Buffer.from("companyName,email\nOnehand,onehand@example.com\n"),
      mimeType: "text/csv",
      name: "companies.csv",
    });

    await page.getByTestId("import-upload-submit").first().click();
    await expect(page).toHaveURL(/\/app\/import\/review\/import-job-mobile-002$/);
    expect(api.protectedRequestsWithoutAuthorization()).toEqual([]);
  });
});

import { expect, test } from "@playwright/test";
import {
  createUserWebApiMockStore,
  seedAuthenticatedSession,
  setupUserWebApiMocks,
  type UserWebApiMockStore,
} from "./support/user-web-api-mocks";

test.describe("G03 import resume UX", () => {
  test("resumes an active import and saves row edits", async ({
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
    await expect(primaryAction).toHaveAttribute("data-import-action", "save");

    const saveResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("/api/imports/import-job-mobile-001/rows") &&
        response.request().method() === "PATCH",
    );
    await primaryAction.click();
    expect((await saveResponsePromise).ok()).toBe(true);
    await expect(primaryAction).toHaveAttribute(
      "data-import-action",
      /validate|confirm/,
    );
    expect(api.protectedRequestsWithoutAuthorization()).toEqual([]);
  });

  test("confirms a ready import job and opens the success detail", async ({
    page,
  }) => {
    const store = createUserWebApiMockStore();
    setFirstImportJobReady(store);
    const api = await setupUserWebApiMocks(page, { store });
    await seedAuthenticatedSession(page);

    await page.goto("/app/import/review/import-job-mobile-001");

    const primaryAction = page.getByTestId("import-review-primary-action").first();
    await expect(primaryAction).toHaveAttribute("data-import-action", "confirm");
    await primaryAction.click();
    await expect(page).toHaveURL(/\/app\/import\/import-user-log-mobile-001$/);
    expect(api.protectedRequestsWithoutAuthorization()).toEqual([]);
  });

  test("restores the import review state after a browser reload", async ({
    page,
  }) => {
    const api = await setupUserWebApiMocks(page);
    await seedAuthenticatedSession(page);

    await page.goto("/app/import/review/import-job-mobile-001");
    await expect(page.getByTestId("import-review-primary-action").first()).toBeVisible();

    await page.reload();

    await expect(page).toHaveURL(/\/app\/import\/review\/import-job-mobile-001$/);
    await expect(page.getByTestId("import-review-primary-action").first()).toBeVisible();
    expect(api.protectedRequestsWithoutAuthorization()).toEqual([]);
  });

  test("cancels an active import and removes it from the active list", async ({
    page,
  }) => {
    const api = await setupUserWebApiMocks(page);
    await seedAuthenticatedSession(page);

    await page.goto("/app/import/review/import-job-mobile-001");
    await page.getByTestId("import-review-cancel-action").first().click();
    await page.getByRole("dialog").getByRole("button").last().click();

    await expect(page).toHaveURL(/\/app\/import$/);
    await expect(
      page.getByTestId("active-import-job-import-job-mobile-001"),
    ).toHaveCount(0);
    expect(api.protectedRequestsWithoutAuthorization()).toEqual([]);
  });

  for (const status of ["EXPIRED", "FAILED"] as const) {
    test(`hides confirm action for ${status} import jobs`, async ({ page }) => {
      const store = createUserWebApiMockStore();
      setFirstImportJobStatus(store, status);
      const api = await setupUserWebApiMocks(page, { store });
      await seedAuthenticatedSession(page);

      await page.goto("/app/import/review/import-job-mobile-001");

      await expect(page.getByTestId("import-review-primary-action")).toHaveCount(0);
      await expect(
        page.getByTestId("import-review-new-file-action").first(),
      ).toBeVisible();
      expect(api.protectedRequestsWithoutAuthorization()).toEqual([]);
    });
  }

  test("redirects missing import job details back to the import list", async ({
    page,
  }) => {
    const api = await setupUserWebApiMocks(page);
    await seedAuthenticatedSession(page);

    await page.goto("/app/import/review/import-job-other-user-001");

    await expect(page).toHaveURL(/\/app\/import$/);
    expect(api.protectedRequestsWithoutAuthorization()).toEqual([]);
  });

  test("uploads a new file, maps it, and opens the import review route", async ({
    page,
  }) => {
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

    const primaryAction = page.getByTestId("import-review-primary-action").first();
    await expect(primaryAction).toHaveAttribute("data-import-action", "map");
    const mapResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("/api/imports/import-job-mobile-002/map") &&
        response.request().method() === "POST",
    );
    await primaryAction.click();
    expect((await mapResponsePromise).ok()).toBe(true);
    await expect(primaryAction).toHaveAttribute("data-import-action", "confirm");
    expect(api.protectedRequestsWithoutAuthorization()).toEqual([]);
  });
});

function setFirstImportJobStatus(
  store: UserWebApiMockStore,
  status: "EXPIRED" | "FAILED",
) {
  const detail = store.importJobs[0];

  if (!detail) {
    throw new Error("Missing import job fixture");
  }

  detail.job = {
    ...nestedRecord(detail.job),
    status,
  };
}

function setFirstImportJobReady(store: UserWebApiMockStore) {
  const detail = store.importJobs[0];

  if (!detail) {
    throw new Error("Missing import job fixture");
  }

  detail.job = {
    ...nestedRecord(detail.job),
    invalidRowCount: 0,
    status: "READY_TO_CONFIRM",
    validRowCount: 1,
  };

  const rows = Array.isArray(detail.rows) ? detail.rows : [];
  detail.rows = rows.map((row) => {
    if (!nestedRecord(row).rowId) {
      return row;
    }

    return {
      ...nestedRecord(row),
      data: {
        companyName: "Onehand Ready Company",
        email: "ready@example.com",
      },
      errors: [],
      status: "VALID",
      targetLabel: "Onehand Ready Company",
    };
  });
}

function nestedRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? value : {};
}

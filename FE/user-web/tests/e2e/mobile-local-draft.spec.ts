import { expect, test, type Locator, type Page } from "@playwright/test";
import {
  MOBILE_LONG_FIXTURE,
  seedAuthenticatedSession,
  setupUserWebApiMocks,
} from "./support/user-web-api-mocks";

test.use({
  hasTouch: true,
  isMobile: true,
  viewport: { width: 390, height: 844 },
});

test.describe("G04 mobile local draft recovery", () => {
  test("restores and clears a meeting note create draft without server draft APIs", async ({
    page,
  }) => {
    const api = await setupUserWebApiMocks(page);
    const runtime = collectRuntimeErrors(page);
    await seedAuthenticatedSession(page);

    await page.goto("/app/meeting-notes?create=1");

    let dialog = meetingNoteCreateDialog(page);
    await expect(dialog).toBeVisible();
    await setRegisteredInputValue(
      dialog.locator("#meeting-create-local-date-time-value"),
      "2026-07-31T10:30"
    );
    await dialog.locator("#meeting-create-title").fill("G04 local draft title");
    await dialog.locator("#meeting-create-company-ids").click();
    await dialog.getByText(MOBILE_LONG_FIXTURE.companyName).first().click();
    await dialog.locator("#meeting-create-title").click();
    await dialog.locator("#meeting-create-contact-ids").click();
    await dialog.getByText(MOBILE_LONG_FIXTURE.contactName).first().click();
    await dialog
      .locator("#meeting-create-details")
      .fill("G04 local draft details");
    await page.waitForTimeout(800);
    await dialog.locator("header button").first().click();
    await expect(dialog).toBeHidden();

    await page.goto("/app/meeting-notes?create=1");

    dialog = meetingNoteCreateDialog(page);
    await expect(dialog).toBeVisible();
    let prompt = dialog.getByTestId("mobile-local-draft-restore-prompt");
    await expect(prompt).toBeVisible();
    await prompt.getByRole("button").nth(1).click();

    await expect(dialog.locator("#meeting-create-title")).toHaveValue(
      "G04 local draft title"
    );
    await expect(dialog.locator("#meeting-create-details")).toHaveValue(
      "G04 local draft details"
    );
    await dialog.locator('button[type="submit"]').click();
    await expect(dialog).toBeHidden();

    await page.goto("/app/meeting-notes?create=1");

    dialog = meetingNoteCreateDialog(page);
    await expect(dialog).toBeVisible();
    prompt = dialog.getByTestId("mobile-local-draft-restore-prompt");
    await expect(prompt).toHaveCount(0);
    expect(api.protectedRequestsWithoutAuthorization()).toEqual([]);
    runtime.assertClean();
  });

});

function meetingNoteCreateDialog(page: Page) {
  return page
    .locator('section[role="dialog"]:visible')
    .filter({ has: page.locator("#meeting-create-title") })
    .first();
}
// 기능 : React Hook Form에 등록된 숨김 input 값을 input/change event와 함께 갱신합니다.
async function setRegisteredInputValue(locator: Locator, value: string) {
  await locator.evaluate((element, nextValue) => {
    const input = element as HTMLInputElement;
    const valueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value"
    )?.set;

    valueSetter?.call(input, nextValue);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }, value);
}

function collectRuntimeErrors(page: Page) {
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];

  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });

  page.on("console", (message) => {
    if (message.type() !== "error") {
      return;
    }

    consoleErrors.push(message.text());
  });

  return {
    assertClean() {
      expect(pageErrors).toEqual([]);
      expect(consoleErrors).toEqual([]);
    },
  };
}

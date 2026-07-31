import { Buffer } from "node:buffer";
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

  test("restores a business card confirm draft for the same scan log", async ({
    page,
  }) => {
    const api = await setupUserWebApiMocks(page);
    const runtime = collectRuntimeErrors(page);
    await seedAuthenticatedSession(page);

    await page.goto("/app/business-cards");
    await page.locator("main button:visible").last().click();

    let dialog = businessCardRegisterDialog(page);
    await expect(dialog).toBeVisible();
    await dialog
      .locator('input[type="file"][capture="environment"]')
      .first()
      .setInputFiles({
        buffer: Buffer.from("fake-business-card-image"),
        mimeType: "image/jpeg",
        name: "business-card.jpg",
      });
    await dialog.locator("footer button").last().click();
    await expect(dialog.locator("#business-card-company-name")).toBeVisible();

    await dialog.locator("#business-card-company-name").fill("G04 temp company");
    await dialog.locator("#business-card-contact-name").fill("G04 temp contact");
    await page.waitForTimeout(800);
    await dialog.locator("header button").first().click();
    await expect(dialog).toBeHidden();

    await page
      .locator("main button:visible")
      .filter({ hasText: MOBILE_LONG_FIXTURE.companyName })
      .first()
      .click();
    const detailDialog = page
      .locator('section[role="dialog"]:visible')
      .filter({ hasText: MOBILE_LONG_FIXTURE.companyName })
      .first();
    await detailDialog.locator("footer button").last().click();

    dialog = businessCardRegisterDialog(page);
    const prompt = dialog.getByTestId("mobile-local-draft-restore-prompt");
    await expect(prompt).toBeVisible();
    await prompt.getByRole("button").nth(1).click();
    await expect(dialog.locator("#business-card-company-name")).toHaveValue(
      "G04 temp company"
    );
    await expect(dialog.locator("#business-card-contact-name")).toHaveValue(
      "G04 temp contact"
    );

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

function businessCardRegisterDialog(page: Page) {
  return page
    .locator('section[role="dialog"]:visible')
    .filter({
      has: page.locator("#business-card-image, #business-card-company-name"),
    })
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

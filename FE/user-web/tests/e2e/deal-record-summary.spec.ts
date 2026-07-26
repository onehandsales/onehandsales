import { expect, test, type Page } from "@playwright/test";
import {
  MOBILE_LONG_FIXTURE,
  seedAuthenticatedSession,
  setupUserWebApiMocks,
} from "./support/user-web-api-mocks";

test.describe("G06 deal record summary", () => {
  test("shows deal and contact list summaries from API response on desktop", async ({
    page,
  }) => {
    const api = await setupUserWebApiMocks(page);
    await seedAuthenticatedSession(page);

    const dealsResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("/api/deals?") &&
        response.request().method() === "GET",
    );
    await page.goto("/app/deals");
    const dealsResponse = await dealsResponsePromise;
    const dealRow = page
      .getByRole("button")
      .filter({ hasText: "RQA002 모바일 브라우저" })
      .first();

    expect((await dealsResponse.json()).pageSize).toBe(15);
    await expect(dealRow).toContainText("RQA002 모바일 상품");
    await expect(dealRow).toContainText("회의록을 연결했어요.");

    const contactsResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("/api/contacts?") &&
        response.request().method() === "GET",
    );
    await page.goto("/app/contacts");
    const contactsResponse = await contactsResponsePromise;
    const contactRow = page
      .getByRole("button")
      .filter({ hasText: MOBILE_LONG_FIXTURE.contactName })
      .first();

    expect((await contactsResponse.json()).pageSize).toBe(15);
    await expect(contactRow).toContainText("1건");
    expect(api.protectedRequestsWithoutAuthorization()).toEqual([]);
  });

  test("keeps record summaries readable on 390px and 360px mobile layouts", async ({
    page,
  }) => {
    const api = await setupUserWebApiMocks(page);
    await seedAuthenticatedSession(page);

    for (const width of [390, 360]) {
      await page.setViewportSize({ height: 820, width });
      await page.goto("/app/deals");
      const dealCard = page
        .getByRole("link")
        .filter({ hasText: "RQA002 모바일 브라우저" })
        .first();

      await expect(dealCard).toContainText("RQA002 모바일 상품");
      await expect(dealCard).toContainText("회의록을 연결했어요.");
      await expectNoDocumentHorizontalOverflow(page, `deal summary ${width}px`);

      await page.goto("/app/contacts");
      const contactCard = page
        .getByRole("link")
        .filter({ hasText: MOBILE_LONG_FIXTURE.contactName })
        .first();

      await expect(contactCard).toContainText("연결 딜 1건");
      await expectNoDocumentHorizontalOverflow(page, `contact summary ${width}px`);
    }

    expect(api.protectedRequestsWithoutAuthorization()).toEqual([]);
  });
});

async function expectNoDocumentHorizontalOverflow(page: Page, label: string) {
  const dimensions = await page.evaluate(() => ({
    bodyScrollWidth: document.body.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    documentScrollWidth: document.documentElement.scrollWidth,
  }));
  const maxScrollWidth = Math.max(
    dimensions.bodyScrollWidth,
    dimensions.documentScrollWidth,
  );

  expect(
    maxScrollWidth,
    `${label} should not create horizontal document overflow`,
  ).toBeLessThanOrEqual(dimensions.clientWidth + 1);
}

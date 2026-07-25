import { expect, test, type Page } from "@playwright/test";
import {
  seedAuthenticatedSession,
  setupUserWebApiMocks,
} from "./support/user-web-api-mocks";

test.describe("G04 deal activity timeline", () => {
  test("shows timeline and creates then updates a manual activity", async ({
    page,
  }) => {
    const api = await setupUserWebApiMocks(page);
    await seedAuthenticatedSession(page);

    await page.goto("/app/deals/deal-mobile-001");
    const timeline = getVisibleDealActivityTimeline(page);

    await expect(timeline).toBeVisible();
    await expect(timeline).toContainText("회의록을 연결했어요.");
    await expect(timeline.getByRole("button", { name: "활동 수정" })).toHaveCount(0);

    await timeline.getByRole("button", { name: "활동 추가" }).click();
    const createDialog = page.getByRole("dialog", { name: "활동 추가" });

    await expect(createDialog).toBeVisible();
    await createDialog.getByLabel("유형").selectOption("CALL");
    await createDialog.getByLabel("발생 시각").fill("2026-07-20T18:30");
    await createDialog.getByLabel("제목").fill("예산 확인 통화");
    await createDialog.getByLabel("내용").fill("예산 승인 일정을 확인했어요.");
    await createDialog.getByRole("button", { name: "저장" }).click();

    await expect(createDialog).toBeHidden();
    await expect(page.getByText("활동을 남겼어요.")).toBeVisible();
    await expect(timeline).toContainText("예산 확인 통화");
    await expect(timeline).toContainText("예산 승인 일정을 확인했어요.");
    await expect(timeline.getByRole("button", { name: "활동 수정" })).toHaveCount(1);

    await timeline.getByRole("button", { name: "활동 수정" }).click();
    const editDialog = page.getByRole("dialog", { name: "활동 수정" });

    await expect(editDialog).toBeVisible();
    await editDialog.getByLabel("유형").selectOption("MEETING");
    await editDialog.getByLabel("제목").fill("예산 확정 미팅");
    await editDialog.getByLabel("내용").fill("대표 확인 후 다음 주 계약서를 검토해요.");
    await editDialog.getByRole("button", { name: "저장" }).click();

    await expect(editDialog).toBeHidden();
    await expect(page.getByText("활동을 저장했어요.")).toBeVisible();
    await expect(timeline).toContainText("예산 확정 미팅");
    await expect(timeline).toContainText("대표 확인 후 다음 주 계약서를 검토해요.");
    await expect(timeline).not.toContainText("예산 확인 통화");

    expect(api.protectedRequestsWithoutAuthorization()).toEqual([]);
  });

  test("keeps timeline inside 390px and 360px mobile viewports", async ({
    page,
  }) => {
    const api = await setupUserWebApiMocks(page);
    await seedAuthenticatedSession(page);

    for (const width of [390, 360]) {
      await page.setViewportSize({ height: 820, width });
      await page.goto("/app/deals/deal-mobile-001");

      const timeline = getVisibleDealActivityTimeline(page);
      await expect(timeline).toBeVisible();
      await expect(timeline).toContainText("활동 추가");
      await expectNoDocumentHorizontalOverflow(page, `deal activity ${width}px`);
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
    dimensions.documentScrollWidth
  );

  expect(
    maxScrollWidth,
    `${label} should not create horizontal document overflow`
  ).toBeLessThanOrEqual(dimensions.clientWidth + 1);
}

function getVisibleDealActivityTimeline(page: Page) {
  return page.locator('section[aria-label="딜 활동"]:visible').first();
}

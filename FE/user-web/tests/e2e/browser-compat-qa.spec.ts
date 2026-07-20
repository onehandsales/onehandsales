import { expect, test, type Locator, type Page } from "@playwright/test";
import {
  MOBILE_LONG_FIXTURE,
  createUserWebApiMockStore,
  seedAuthenticatedSession,
  setupUserWebApiMocks,
} from "./support/user-web-api-mocks";

const BROWSER_COMPAT_COMPANY = "RQA003 브라우저 호환 회사";
const BROWSER_COMPAT_CONTACT = "RQA003 브라우저 담당자";
const BROWSER_COMPAT_PRODUCT = "RQA003 브라우저 상품";
const BROWSER_COMPAT_DEAL = "RQA003 브라우저 딜";
const BROWSER_COMPAT_SCHEDULE = "RQA003 브라우저 일정";
const BROWSER_COMPAT_MEETING = "RQA003 브라우저 회의록";
const MULTI_TAB_UPDATED_COMPANY = "RQA003 두 탭 새로고침 수정 회사";

test.describe("G03 Chrome/Edge desktop browser compatibility QA", () => {
  test("checks login entry and protected route redirect", async ({ page }) => {
    const api = await setupUserWebApiMocks(page);
    const runtime = collectRuntimeErrors(page);

    await page.goto("/app/companies");

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("button", { name: "Google" })).toBeVisible();
    expect(api.protectedRequestsWithoutAuthorization()).toEqual([]);

    await page.goto("/en-us/login");
    await expect(page.getByRole("heading", { name: "Your AI workspace" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Google" })).toBeVisible();

    runtime.assertClean();
  });

  test("creates company, contact, product, deal, schedule, and meeting note", async ({
    page,
  }) => {
    const api = await setupUserWebApiMocks(page);
    const runtime = collectRuntimeErrors(page);
    await seedAuthenticatedSession(page);

    await page.goto("/app/companies");
    await expect(page.getByRole("button", { name: "회사 생성" }).first()).toBeVisible();

    await createCompany(page);
    await createContact(page);
    await createProduct(page);
    await createDeal(page);
    await createSchedule(page);
    await createMeetingNote(page);

    expect(api.protectedRequestsWithoutAuthorization()).toEqual([]);
    runtime.assertClean();
  });

  test("keeps route state through reload and browser history", async ({ page }) => {
    await setupUserWebApiMocks(page);
    const runtime = collectRuntimeErrors(page);
    await seedAuthenticatedSession(page);

    await page.goto("/app/deals");
    await expect(page.locator("body")).toContainText("RQA002 모바일 브라우저 긴 딜명");

    await page.reload();
    await expect(page).toHaveURL(/\/app\/deals$/);
    await expect(page.locator("body")).toContainText("RQA002 모바일 브라우저 긴 딜명");

    await goToNav(page, "회사");
    await expect(page).toHaveURL(/\/app\/companies$/);
    await expect(page.locator("body")).toContainText(MOBILE_LONG_FIXTURE.companyName);

    await goToNav(page, "딜");
    await expect(page).toHaveURL(/\/app\/deals$/);
    await expect(page.locator("body")).toContainText("RQA002 모바일 브라우저 긴 딜명");

    await page.goBack();
    await expect(page).toHaveURL(/\/app\/companies$/);
    await expect(page.locator("body")).toContainText(MOBILE_LONG_FIXTURE.companyName);

    await page.goForward();
    await expect(page).toHaveURL(/\/app\/deals$/);
    await expect(page.locator("body")).toContainText("RQA002 모바일 브라우저 긴 딜명");

    runtime.assertClean();
  });

  test("keeps shared data stable across two tabs after refresh", async ({
    context,
    page,
  }) => {
    const store = createUserWebApiMockStore();
    await setupUserWebApiMocks(page, { store });
    const runtime = collectRuntimeErrors(page);
    await seedAuthenticatedSession(page);

    const secondPage = await context.newPage();
    await setupUserWebApiMocks(secondPage, { store });
    const secondRuntime = collectRuntimeErrors(secondPage);
    await seedAuthenticatedSession(secondPage);

    await page.goto("/app/companies");
    await secondPage.goto("/app/companies");
    await expect(page.locator("body")).toContainText(MOBILE_LONG_FIXTURE.companyName);
    await expect(secondPage.locator("body")).toContainText(MOBILE_LONG_FIXTURE.companyName);

    await updateCompanyNameFromBrowser(page, MULTI_TAB_UPDATED_COMPANY);
    await secondPage.reload();

    await expect(secondPage.locator("body")).toContainText(MULTI_TAB_UPDATED_COMPANY);
    await expect(secondPage.locator("body")).not.toContainText(MOBILE_LONG_FIXTURE.companyName);

    runtime.assertClean();
    secondRuntime.assertClean();
    await secondPage.close();
  });

  test("shows loading state while API responses are delayed", async ({ page }) => {
    await setupUserWebApiMocks(page, {
      delayMs: (request) =>
        request.method === "GET" && request.pathname === "/api/companies" ? 1_200 : 0,
    });
    const runtime = collectRuntimeErrors(page);
    await seedAuthenticatedSession(page);

    const companiesResponse = page.waitForResponse(
      (response) =>
        response.request().method() === "GET" &&
        new URL(response.url()).pathname === "/api/companies",
    );

    await page.goto("/app/companies");
    await expect(page.locator(".animate-pulse").first()).toBeVisible();

    await companiesResponse;
    await expect(page.locator("body")).toContainText(MOBILE_LONG_FIXTURE.companyName);

    runtime.assertClean();
  });
});

async function createCompany(page: Page) {
  await page.getByRole("button", { name: "회사 생성" }).first().click();
  const dialog = getDialog(page, "회사 생성");

  await expect(dialog).toBeVisible();
  await dialog.getByLabel("회사명").fill(BROWSER_COMPAT_COMPANY);
  await selectManagedOption(dialog, "분야명", "모바일 QA 분야");
  await selectManagedOption(dialog, "지역명", "서울/수도권");
  await dialog.getByLabel("메모").fill("G03 Chrome Edge company smoke");
  await dialog.getByRole("button", { name: "저장" }).click();

  await expect(dialog).toBeHidden();
  await expectAndCloseNotice(page, "회사를 추가했어요.");
  await expect(page.getByText(BROWSER_COMPAT_COMPANY).first()).toBeVisible();
}

async function createContact(page: Page) {
  await goToNav(page, "담당자");
  await page.getByRole("button", { name: "담당자 생성" }).first().click();
  const dialog = getDialog(page, "담당자 생성");

  await expect(dialog).toBeVisible();
  await dialog.getByLabel("담당자명").fill(BROWSER_COMPAT_CONTACT);
  await dialog.getByLabel("휴대폰번호").fill("010-3333-0303");
  await dialog.getByLabel("이메일").fill("rqa003.browser@example.test");
  await selectSearchOption(dialog, "회사", BROWSER_COMPAT_COMPANY);
  await selectManagedOption(dialog, "부서명", "영업기획본부");
  await selectManagedOption(dialog, "직급명", "팀장");
  await dialog.getByLabel("메모").fill("G03 Chrome Edge contact smoke");
  await dialog.getByRole("button", { name: "저장" }).click();

  await expect(dialog).toBeHidden();
  await expectAndCloseNotice(page, "담당자를 추가했어요.");
  await expect(page.getByText(BROWSER_COMPAT_CONTACT).first()).toBeVisible();
}

async function createProduct(page: Page) {
  await goToNav(page, "제품");
  await page.getByRole("button", { name: "제품 생성" }).first().click();
  const dialog = getDialog(page, "제품 생성");

  await expect(dialog).toBeVisible();
  await dialog.getByLabel("제품명").fill(BROWSER_COMPAT_PRODUCT);
  await dialog.getByLabel("단가").fill("303000");
  await selectManagedOption(dialog, "카테고리명", "SaaS");
  await selectManagedOption(dialog, "상태명", "판매중");
  await dialog.getByLabel("메모").fill("G03 Chrome Edge product smoke");
  await dialog.getByRole("button", { name: "저장", exact: true }).click();

  await expect(dialog).toBeHidden();
  await expectAndCloseNotice(page, "제품을 추가했어요.");
  await expect(page.getByText(BROWSER_COMPAT_PRODUCT).first()).toBeVisible();
}

async function createDeal(page: Page) {
  await goToNav(page, "딜");
  await page.getByRole("button", { name: "딜 생성" }).first().click();
  const dialog = getDialog(page, "딜 생성");

  await expect(dialog).toBeVisible();
  await dialog.getByLabel("딜이름").fill(BROWSER_COMPAT_DEAL);
  await dialog.getByLabel("금액").fill("3030000");
  await selectSearchOption(dialog, "회사", BROWSER_COMPAT_COMPANY);
  await selectSearchOption(dialog, "담당자", BROWSER_COMPAT_CONTACT);
  await dialog.getByPlaceholder("제품명 검색").fill(BROWSER_COMPAT_PRODUCT);
  await dialog
    .getByRole("button", { name: new RegExp(escapeRegExp(BROWSER_COMPAT_PRODUCT)) })
    .first()
    .click();
  await dialog.getByLabel("예상 마감일").fill("2026-08-03");
  await dialog.getByLabel("다음 행동", { exact: true }).fill("브라우저 호환 제안");
  await dialog.getByLabel("메모").fill("G03 Chrome Edge deal smoke");
  await dialog.getByRole("button", { name: "저장" }).click();

  await expect(dialog).toBeHidden();
  await expect(page).toHaveURL(/\/app\/deals$/);
  await expect(page.getByText(BROWSER_COMPAT_DEAL).first()).toBeVisible();
}

async function createSchedule(page: Page) {
  await goToNav(page, "일정");
  await page.getByRole("button", { name: "일정 보기 방식" }).click();
  await page.getByRole("option", { name: "주" }).click();
  await page.getByRole("button", { name: "일정 생성" }).first().click();
  const dialog = page.getByRole("dialog").filter({ hasText: "일정 생성" }).first();

  await expect(dialog).toBeVisible();
  await dialog.getByLabel("제목").fill(BROWSER_COMPAT_SCHEDULE);
  await dialog.getByLabel("시작일시").fill("2026-08-03T10:00");
  await dialog.getByLabel("종료일시").fill("2026-08-03T11:00");
  await dialog.getByLabel("장소").fill("Chrome Edge QA 회의실");
  await dialog.getByLabel("연결 딜").fill(BROWSER_COMPAT_DEAL);
  await dialog.getByRole("button", { name: new RegExp(escapeRegExp(BROWSER_COMPAT_DEAL)) }).click();
  await dialog.getByLabel("메모").fill("G03 Chrome Edge schedule smoke");
  await dialog.getByRole("button", { name: "저장" }).click();

  await expect(dialog).toBeHidden();
  await expectAndCloseNotice(page, `${BROWSER_COMPAT_SCHEDULE} 일정을 만들었어요.`);
  await expect(page.getByText(BROWSER_COMPAT_SCHEDULE).first()).toBeVisible();
}

async function createMeetingNote(page: Page) {
  await goToNav(page, "회의록");
  await page.getByRole("button", { name: "회의록 생성" }).first().click();
  const dialog = getDialog(page, "회의록 생성");

  await expect(dialog).toBeVisible();
  await dialog.getByLabel("회의록 제목").fill(BROWSER_COMPAT_MEETING);
  await selectEntityOption(dialog, "회사", BROWSER_COMPAT_COMPANY);
  await selectEntityOption(dialog, "담당자", BROWSER_COMPAT_CONTACT);
  await selectEntityOption(dialog, "제품(옵션)", BROWSER_COMPAT_PRODUCT);
  await selectEntityOption(dialog, "딜(옵션)", BROWSER_COMPAT_DEAL);
  await dialog.getByLabel("원문 메모").fill("Chrome과 Edge에서 같은 회의록 저장 smoke.");
  await dialog.getByLabel("상세 내용").fill("브라우저 호환 QA 상세 내용");
  await dialog.getByLabel("다음 계획").fill("reload와 history 확인");
  await dialog.getByLabel("필요 액션").fill("두 탭 새로고침 확인");
  await dialog.getByRole("button", { name: "저장", exact: true }).click();

  await expect(dialog).toBeHidden();
  await expectAndCloseNotice(page, "회의록을 추가했어요.");
  await expect(page.getByText(BROWSER_COMPAT_MEETING).first()).toBeVisible();
}

async function updateCompanyNameFromBrowser(page: Page, companyName: string) {
  await page.evaluate(async (nextCompanyName) => {
    const accessToken = window.localStorage.getItem("onehand.userWeb.accessToken");
    const response = await window.fetch(
      "http://localhost:3000/api/companies/company-mobile-001",
      {
        body: JSON.stringify({ companyName: nextCompanyName }),
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        method: "PATCH",
      },
    );

    if (!response.ok) {
      throw new Error(`Company update failed: ${response.status}`);
    }
  }, companyName);
}

function getDialog(page: Page, title: string) {
  return page.getByRole("dialog", { name: title }).first();
}

async function goToNav(page: Page, name: string) {
  await page.getByRole("link", { name }).first().click();
}

async function expectAndCloseNotice(page: Page, message: string) {
  const noticeText = page.getByText(message).first();
  const noticeDialog = page.getByRole("dialog").filter({ hasText: message }).first();
  const closeButton = noticeDialog.getByRole("button", {
    exact: true,
    name: "닫기",
  });

  await expect(noticeText).toBeVisible();

  if (await noticeDialog.isVisible({ timeout: 500 }).catch(() => false)) {
    await closeButton.click();
    await expect(noticeDialog).toBeHidden();
  }
}

async function selectManagedOption(
  scope: Locator,
  inputName: string,
  optionName: string,
) {
  await scope.getByLabel(inputName, { exact: true }).fill(optionName);
  await scope.getByRole("button", { exact: true, name: optionName }).first().click();
}

async function selectSearchOption(
  scope: Locator,
  label: string,
  optionName: string,
) {
  await scope.getByLabel(label, { exact: true }).fill(optionName);
  await scope
    .getByRole("button", { name: new RegExp(escapeRegExp(optionName)) })
    .first()
    .click();
}

async function selectEntityOption(
  dialog: Locator,
  triggerName: string,
  optionName: string,
) {
  await dialog.getByRole("button", { name: triggerName }).click();
  await dialog.getByLabel(new RegExp(escapeRegExp(optionName))).check();
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

    const text = message.text();
    if (text.includes("favicon.ico")) {
      return;
    }

    consoleErrors.push(text);
  });

  return {
    assertClean() {
      expect(
        { consoleErrors, pageErrors },
        "Browser compatibility smoke should not emit page or console errors.",
      ).toEqual({ consoleErrors: [], pageErrors: [] });
    },
  };
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

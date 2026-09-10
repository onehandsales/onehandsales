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

  test("creates company, contact, product, and deal", async ({
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
  await selectCompanyRegionOption(dialog, "서울");
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
  await dialog.getByLabel("전화번호", { exact: true }).fill("010-3333-0303");
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

// 기능 : G06 이후 회사 지역은 국가/지역 select 조합이므로 최신 UI 계약대로 option을 선택합니다.
async function selectCompanyRegionOption(scope: Locator, optionName: string) {
  await scope.getByLabel("지역", { exact: true }).selectOption({ label: optionName });
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

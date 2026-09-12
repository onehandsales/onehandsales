import { expect, test, type Page } from "@playwright/test";
import {
  MOBILE_LONG_FIXTURE,
  seedAuthenticatedSession,
  setupUserWebApiMocks,
} from "./support/user-web-api-mocks";

const MOBILE_ROUTES: ReadonlyArray<{
  readonly path: string;
  readonly expectedText?: string;
  readonly expectsEmptyHome?: boolean;
  readonly hasMobileHeader: boolean;
}> = [
  { path: "/app", expectsEmptyHome: true, hasMobileHeader: true },
  { path: "/app?account=settings", expectedText: MOBILE_LONG_FIXTURE.email, hasMobileHeader: true },
  { path: "/app/more", expectedText: MOBILE_LONG_FIXTURE.email, hasMobileHeader: true },
];

test.describe("G02 mobile browser release QA", () => {
  test("redirects protected mobile routes without a session", async ({ page }) => {
    // 1. 비동기 결과를 받아 api에 저장한다.
    const api = await setupUserWebApiMocks(page);
    // 2. 이후 처리에 사용할 runtime을 계산한다.
    const runtime = collectRuntimeErrors(page);

    // 3. 필요한 비동기 작업을 실행한다.
    await page.goto("/app");

    // 4. 필요한 비동기 작업을 실행한다.
    await expect(page).toHaveURL(/\/login$/);
    // 5. 필요한 비동기 작업을 실행한다.
    await expect(page.getByRole("button", { name: "Google" })).toBeVisible();
    // 6. 테스트 기대 조건을 검증한다.
    expect(api.protectedRequestsWithoutAuthorization()).toEqual([]);
    // 7. 현재 단계에서 필요한 side effect를 실행한다.
    runtime.assertClean();
  });

  test("loads core App routes without mobile shell overlap or page overflow", async ({ page }, testInfo) => {
    // 1. 비동기 결과를 받아 api에 저장한다.
    const api = await setupUserWebApiMocks(page);
    // 2. 이후 처리에 사용할 runtime을 계산한다.
    const runtime = collectRuntimeErrors(page);
    // 3. 필요한 비동기 작업을 실행한다.
    await seedAuthenticatedSession(page);

    // 4. 대상 목록을 순회하며 필요한 값을 처리한다.
    for (const route of MOBILE_ROUTES) {
      await page.goto(route.path);
      if (route.expectsEmptyHome) {
        await expect(page.getByTestId("app-home-empty")).toBeVisible();
      }
      if (route.expectedText) {
        await expect(page.locator("body")).toContainText(route.expectedText);
      }
      await expectMobileShell(page, route.hasMobileHeader);
      await expectNoDocumentHorizontalOverflow(page, `${testInfo.project.name} ${route.path}`);
    }

    // 5. 테스트 기대 조건을 검증한다.
    expect(api.protectedRequestsWithoutAuthorization()).toEqual([]);
    // 6. 현재 단계에서 필요한 side effect를 실행한다.
    runtime.assertClean();
  });
});

// 기능 : bottom Nav 기능을 수행합니다.
function bottomNav(page: Page) {
  return page.locator("nav").last();
}

// 기능 : expect Mobile Shell 기대 상태를 검증합니다.
async function expectMobileShell(page: Page, hasMobileHeader: boolean) {
  await expect(bottomNav(page)).toBeVisible();

  if (hasMobileHeader) {
    await expect(page.getByTestId("mobile-app-header")).toBeVisible();
  }
}

// 기능 : expect No Document Horizontal Overflow 기대 상태를 검증합니다.
async function expectNoDocumentHorizontalOverflow(page: Page, label: string) {
  const metrics = await page.evaluate(() => ({
    documentScrollWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
  }));

  expect(metrics.documentScrollWidth, label).toBeLessThanOrEqual(metrics.viewportWidth + 2);
}

// 기능 : collect Runtime Errors 기능을 수행합니다.
function collectRuntimeErrors(page: Page) {
  // 1. 이후 처리에 사용할 pageErrors을 계산한다.
  const pageErrors: string[] = [];
  // 2. 이후 처리에 사용할 consoleErrors을 계산한다.
  const consoleErrors: string[] = [];

  // 3. 현재 단계에서 필요한 side effect를 실행한다.
  page.on("pageerror", (error) => pageErrors.push(error.message));
  // 4. 현재 단계에서 필요한 side effect를 실행한다.
  page.on("console", (message) => {
    if (message.type() === "error" && !message.text().includes("favicon.ico")) {
      consoleErrors.push(message.text());
    }
  });

  // 5. 계산된 결과를 호출자에게 반환한다.
  return {
    // 기능 : assert Clean 기능을 수행합니다.
    assertClean() {
      expect({ consoleErrors, pageErrors }).toEqual({ consoleErrors: [], pageErrors: [] });
    },
  };
}

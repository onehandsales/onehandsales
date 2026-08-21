import { Buffer } from "node:buffer";
import { expect, test, type Locator, type Page } from "@playwright/test";
import {
  createUserWebApiMockStore,
  MOBILE_LONG_FIXTURE,
  seedAuthenticatedSession,
  setupUserWebApiMocks,
  type UserWebApiMockStore,
} from "./support/user-web-api-mocks";

const MOBILE_ROUTES: ReadonlyArray<{
  readonly path: string;
  readonly expectedText: string;
  readonly hasMobileHeader: boolean;
}> = [
  { path: "/app", expectedText: "오늘 일정", hasMobileHeader: true },
  {
    path: "/app/companies",
    expectedText: MOBILE_LONG_FIXTURE.companyName,
    hasMobileHeader: true,
  },
  {
    path: "/app/contacts",
    expectedText: MOBILE_LONG_FIXTURE.email,
    hasMobileHeader: true,
  },
  {
    path: "/app/products",
    expectedText: MOBILE_LONG_FIXTURE.url,
    hasMobileHeader: true,
  },
  {
    path: "/app/deals",
    expectedText: "RQA002 모바일 브라우저 긴 딜명",
    hasMobileHeader: true,
  },
  { path: "/app/schedules", expectedText: "일정", hasMobileHeader: false },
  {
    path: "/app/schedules/week?weekStart=2026-07-20",
    expectedText: "주간 보고서",
    hasMobileHeader: false,
  },
  {
    path: "/app/meeting-notes",
    expectedText: "RQA002 모바일 회의록",
    hasMobileHeader: true,
  },
  // 기능 : G05 회의록 상세 AI 후속 작업 섹션의 모바일 overflow를 함께 확인합니다.
  {
    path: "/app/meeting-notes/meeting-note-mobile-001",
    expectedText: "AI 후속 작업",
    hasMobileHeader: false,
  },
  {
    path: "/app/business-cards",
    expectedText: MOBILE_LONG_FIXTURE.contactName,
    hasMobileHeader: true,
  },
  {
    path: "/app/import",
    expectedText: "rqa002-mobile-browser-long-file-name-390-360.xlsx",
    hasMobileHeader: true,
  },
  { path: "/app/trash", expectedText: "삭제된", hasMobileHeader: true },
  { path: "/app/notifications", expectedText: "딜 마감 reminder", hasMobileHeader: true },
  { path: "/app?account=settings", expectedText: "설정", hasMobileHeader: true },
  { path: "/app/more", expectedText: "영업 관리", hasMobileHeader: true },
];

test.describe("G02 mobile browser release QA", () => {
  test("redirects protected mobile routes without a session", async ({ page }) => {
    const api = await setupUserWebApiMocks(page);
    const runtime = collectRuntimeErrors(page);

    await page.goto("/app/companies");

    await expect(page).toHaveURL(/\/login$/);
    expect(
      api.protectedRequestsWithoutAuthorization(),
      "Protected App routes should redirect before calling private API endpoints.",
    ).toEqual([]);
    runtime.assertClean();
  });

  test("loads core App routes without mobile shell overlap or page overflow", async ({
    page,
  }, testInfo) => {
    const api = await setupUserWebApiMocks(page);
    const runtime = collectRuntimeErrors(page);
    await seedAuthenticatedSession(page);

    for (const route of MOBILE_ROUTES) {
      await page.goto(route.path);
      await expect(page.locator("body")).toContainText(route.expectedText);
      await expectMobileShell(page, route.hasMobileHeader);
      await expectNoDocumentHorizontalOverflow(
        page,
        `${testInfo.project.name} ${route.path}`,
      );

      if (route.path === "/app/deals") {
        await expect(page.getByText("초기 접촉").last()).toBeVisible();
        await expect(page.getByText("니즈 확인").last()).toBeVisible();
      }
    }

    expect(
      api.protectedRequestsWithoutAuthorization(),
      "Authenticated mobile route smoke must keep Authorization on private API calls.",
    ).toEqual([]);
    runtime.assertClean();
  });

  test("keeps create panel, dropdown, toast, and keyboard focus inside mobile viewport", async ({
    page,
  }, testInfo) => {
    const api = await setupUserWebApiMocks(page);
    const runtime = collectRuntimeErrors(page);
    await seedAuthenticatedSession(page);

    await page.goto("/app/companies");
    await page.getByRole("button", { name: "회사 생성" }).last().click();

    const dialog = page.getByRole("dialog", { name: "회사 생성" });
    await expect(dialog).toBeVisible();
    await expectLocatorWithinViewport(page, dialog, "company create dialog");

    await dialog.getByLabel("회사명").fill(MOBILE_LONG_FIXTURE.companyName);
    await dialog.getByLabel("분야명").click();
    await expect(dialog.getByText("분야 검색")).toBeVisible();
    await expectNoDocumentHorizontalOverflow(
      page,
      `${testInfo.project.name} company field dropdown`,
    );
    await dialog
      .getByRole("button", { exact: true, name: "모바일 QA 분야" })
      .click();

    // 기능 : G06 지역 선택은 검색 드롭다운이 아니라 국가/지역 select 조합으로 확인합니다.
    const regionSelect = dialog.getByLabel("지역", { exact: true });
    await regionSelect.focus();
    await expect(regionSelect).toBeFocused();
    await regionSelect.selectOption({ label: "서울/수도권" });
    await expectNoDocumentHorizontalOverflow(
      page,
      `${testInfo.project.name} company region select`,
    );

    const saveButton = dialog.getByRole("button", { exact: true, name: "저장" });
    await saveButton.focus();
    await expect(saveButton).toBeFocused();
    await saveButton.click();

    await expect(
      page.locator('[role="dialog"]').filter({ hasText: "회사를 추가했어요." }).last(),
    ).toBeVisible();
    await expect(page.locator("body")).toContainText(MOBILE_LONG_FIXTURE.companyName);
    await expectNoDocumentHorizontalOverflow(
      page,
      `${testInfo.project.name} company create toast`,
    );

    expect(
      api.protectedRequestsWithoutAuthorization(),
      "Company create smoke must keep Authorization on private API calls.",
    ).toEqual([]);
    runtime.assertClean();
  });

  test("keeps business card capture failure actions inside mobile viewport", async ({
    page,
  }, testInfo) => {
    const store = createUserWebApiMockStore();
    const api = await setupUserWebApiMocks(page, { store });
    const runtime = collectRuntimeErrors(page);
    await seedAuthenticatedSession(page);

    await page.route("**/api/business-card-scans", async (route) => {
      if (route.request().method().toUpperCase() !== "POST") {
        await route.fallback();
        return;
      }

      const failedScan = createBusinessCardFailureScan(store);
      store.businessCardScans.unshift(failedScan);
      await route.fulfill({
        body: JSON.stringify(failedScan),
        contentType: "application/json",
        status: 201,
      });
    });

    await page.goto("/app/business-cards");
    await page.getByRole("button", { name: "명함 스캔" }).last().click();

    const dialog = page.getByRole("dialog", { name: "명함 스캔" });
    await expect(dialog).toBeVisible();

    const captureInput = dialog
      .locator('input[type="file"][capture="environment"]')
      .first();
    await expect(captureInput).toHaveAttribute("accept", "image/*");
    await captureInput.setInputFiles({
      buffer: Buffer.from("fake-business-card-image"),
      mimeType: "image/jpeg",
      name: "business-card.jpg",
    });

    await dialog.getByRole("button", { exact: true, name: "명함 스캔" }).click();

    await expect(dialog.getByText("명함을 읽지 못했어요.")).toBeVisible();
    await expect(dialog.getByRole("button", { name: "다시 촬영" })).toBeVisible();
    await expect(dialog.getByRole("button", { name: "파일 바꾸기" })).toBeVisible();
    await expect(dialog.getByRole("button", { name: "수동 입력" })).toBeVisible();
    await expectLocatorWithinViewport(page, dialog, "business card failure dialog");
    await expectNoDocumentHorizontalOverflow(
      page,
      `${testInfo.project.name} business card failure dialog`,
    );

    await dialog.getByRole("button", { name: "수동 입력" }).click();
    await expect(page).toHaveURL(/\/app\/contacts\/new$/);

    expect(
      api.protectedRequestsWithoutAuthorization(),
      "Business card failure UX must keep Authorization on private API calls.",
    ).toEqual([]);
    runtime.assertClean();
  });

  test("uses meeting note audio upload fallback when browser recording is unsupported", async ({
    page,
  }, testInfo) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, "MediaRecorder", {
        configurable: true,
        value: undefined,
      });
      Object.defineProperty(window.navigator, "mediaDevices", {
        configurable: true,
        value: undefined,
      });
    });
    const store = createUserWebApiMockStore();
    const initialMeetingNoteCount = store.meetingNotes.length;
    const api = await setupUserWebApiMocks(page, { store });
    const runtime = collectRuntimeErrors(page);
    await seedAuthenticatedSession(page);

    await page.goto("/app/meeting-notes?create=1");

    const dialog = page.getByRole("dialog", { name: "회의록 생성" });
    await expect(dialog).toBeVisible();
    await setRegisteredInputValue(
      dialog.locator("#meeting-create-local-date-time-value"),
      "2026-07-31T10:30",
    );
    const titleInput = dialog.locator("#meeting-create-title");
    await titleInput.fill("G03 모바일 STT fallback 회의록");
    await dialog.getByRole("button", { name: "회사 선택" }).click();
    await dialog.getByText(MOBILE_LONG_FIXTURE.companyName).first().click();
    await titleInput.click();
    await dialog.getByRole("button", { name: "담당자 선택" }).click();
    await dialog.getByText(MOBILE_LONG_FIXTURE.contactName).first().click();
    await titleInput.click();

    await dialog.getByRole("button", { exact: true, name: "녹음" }).click();
    await expect(
      dialog.getByText("이 브라우저에서는 녹음을 사용할 수 없어요. 음성 파일로 올려 주세요."),
    ).toBeVisible();

    await dialog.locator("#meeting-create-audio-file").setInputFiles({
      buffer: Buffer.from("fake meeting audio"),
      mimeType: "audio/webm",
      name: "meeting.webm",
    });
    await expect(dialog.getByText("meeting.webm")).toBeVisible();

    await dialog.getByRole("button", { exact: true, name: "초안 만들기" }).click();

    await expect(dialog.getByLabel("상세 내용")).toHaveValue(
      "모바일 현장 미팅에서 도입 범위와 다음 확인 항목을 정리했어요.",
    );
    await expect(dialog.getByLabel("다음 계획")).toHaveValue(
      "견적 조건을 확인한 뒤 다음 주에 재논의해요.",
    );
    await expect(dialog.getByLabel("필요 액션")).toHaveValue(
      "보안 자료와 모바일 견적서를 보내요.",
    );
    await expect(
      dialog.getByRole("button", { name: /녹취 텍스트/ }),
    ).toBeVisible();
    expect(store.meetingNotes.length).toBe(initialMeetingNoteCount);
    await expectLocatorWithinViewport(page, dialog, "meeting note STT fallback dialog");
    await expectNoDocumentHorizontalOverflow(
      page,
      `${testInfo.project.name} meeting note STT fallback`,
    );
    expect(
      api.protectedRequestsWithoutAuthorization(),
      "Meeting note STT fallback must keep Authorization on private API calls.",
    ).toEqual([]);
    runtime.assertClean();
  });
});

function bottomNav(page: Page) {
  return page.locator("nav").filter({ hasText: "더보기" }).last();
}

async function expectMobileShell(page: Page, hasMobileHeader: boolean) {
  const nav = bottomNav(page);
  await expect(nav).toBeVisible();

  for (const label of ["홈", "딜", "일정", "회의록", "더보기"]) {
    await expect(nav.getByRole("link", { name: label })).toBeVisible();
  }

  if (hasMobileHeader) {
    await expect(page.locator("header").filter({ hasText: "한손에 영업" })).toBeVisible();
    await expect(page.getByRole("button", { name: "통합검색" })).toBeVisible();
  }

  const shellMetrics = await page.evaluate(() => {
    const header = findVisibleElementAtEdge(
      Array.from(document.querySelectorAll("header")).filter((element) =>
        element.textContent?.includes("한손에 영업"),
      ),
      "top",
    );
    const navElement = findVisibleElementAtEdge(
      Array.from(document.querySelectorAll("nav")).filter((element) =>
        element.textContent?.includes("더보기"),
      ),
      "bottom",
    );

    return {
      header: header ? rectToPlainObject(header.getBoundingClientRect()) : null,
      nav: navElement ? rectToPlainObject(navElement.getBoundingClientRect()) : null,
      viewportHeight: window.innerHeight,
    };

    function findVisibleElementAtEdge(elements: Element[], edge: "bottom" | "top") {
      return elements
        .map((element) => ({
          element,
          rect: element.getBoundingClientRect(),
          style: window.getComputedStyle(element),
        }))
        .filter(
          (item) =>
            item.rect.width > 0 &&
            item.rect.height > 0 &&
            item.style.display !== "none" &&
            item.style.visibility !== "hidden",
        )
        .sort((left, right) =>
          edge === "bottom"
            ? right.rect.top - left.rect.top
            : left.rect.top - right.rect.top,
        )[0]?.element;
    }

    function rectToPlainObject(rect: DOMRect) {
      return {
        bottom: rect.bottom,
        height: rect.height,
        left: rect.left,
        right: rect.right,
        top: rect.top,
        width: rect.width,
      };
    }
  });

  expect(shellMetrics.nav, "Mobile bottom navigation should exist.").not.toBeNull();

  if (shellMetrics.nav) {
    expect(shellMetrics.nav.bottom).toBeLessThanOrEqual(shellMetrics.viewportHeight + 2);
  }

  if (hasMobileHeader && shellMetrics.header && shellMetrics.nav) {
    expect(shellMetrics.header.bottom).toBeLessThan(shellMetrics.nav.top);
  }

  const labelOverlaps = await page.evaluate(() => {
    const navElement = Array.from(document.querySelectorAll("nav"))
      .map((element) => ({
        element,
        rect: element.getBoundingClientRect(),
        style: window.getComputedStyle(element),
      }))
      .filter(
        (item) =>
          item.element.textContent?.includes("더보기") &&
          item.rect.width > 0 &&
          item.rect.height > 0 &&
          item.style.display !== "none" &&
          item.style.visibility !== "hidden",
      )
      .sort((left, right) => right.rect.top - left.rect.top)[0]?.element;

    if (!navElement) {
      return ["bottom nav missing"];
    }

    const labels = Array.from(navElement.querySelectorAll("a span")).map((element) => {
      const rect = element.getBoundingClientRect();
      return {
        bottom: rect.bottom,
        left: rect.left,
        right: rect.right,
        text: element.textContent?.trim() ?? "",
        top: rect.top,
      };
    });
    const overlaps: string[] = [];

    for (let leftIndex = 0; leftIndex < labels.length; leftIndex += 1) {
      for (let rightIndex = leftIndex + 1; rightIndex < labels.length; rightIndex += 1) {
        const left = labels[leftIndex];
        const right = labels[rightIndex];

        if (
          left &&
          right &&
          left.text &&
          right.text &&
          left.right > right.left &&
          left.left < right.right &&
          left.bottom > right.top &&
          left.top < right.bottom
        ) {
          overlaps.push(`${left.text}/${right.text}`);
        }
      }
    }

    return overlaps;
  });

  expect(labelOverlaps, "Mobile bottom nav labels should not overlap.").toEqual([]);
}

async function expectNoDocumentHorizontalOverflow(page: Page, label: string) {
  const metrics = await page.evaluate(() => {
    const tolerance = 2;
    const offenders = Array.from(document.body.querySelectorAll("*"))
      .map((element) => {
        const rect = element.getBoundingClientRect();
        const htmlElement = element as HTMLElement;
        return {
          className: String(htmlElement.className),
          left: Math.floor(rect.left),
          right: Math.ceil(rect.right),
          tag: htmlElement.tagName.toLowerCase(),
          text: (htmlElement.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 96),
          width: Math.ceil(rect.width),
        };
      })
      .filter(
        (item) =>
          item.width > 0 &&
          (item.right > window.innerWidth + tolerance || item.left < -tolerance),
      )
      .slice(0, 8);

    return {
      documentScrollWidth: document.documentElement.scrollWidth,
      offenders,
      viewportWidth: window.innerWidth,
    };
  });

  expect(
    metrics.documentScrollWidth,
    `${label} document overflow offenders=${JSON.stringify(metrics.offenders)}`,
  ).toBeLessThanOrEqual(metrics.viewportWidth + 2);
}

async function expectLocatorWithinViewport(page: Page, locator: Locator, label: string) {
  const box = await locator.boundingBox();
  const viewport = page.viewportSize();

  expect(box, `${label} should have a visible bounding box.`).not.toBeNull();
  expect(viewport, `${label} should run with a viewport.`).not.toBeNull();

  if (!box || !viewport) {
    return;
  }

  expect(box.x, `${label} left edge`).toBeGreaterThanOrEqual(-2);
  expect(box.y, `${label} top edge`).toBeGreaterThanOrEqual(-2);
  expect(box.x + box.width, `${label} right edge`).toBeLessThanOrEqual(
    viewport.width + 2,
  );
  expect(box.y + box.height, `${label} bottom edge`).toBeLessThanOrEqual(
    viewport.height + 2,
  );
}

async function setRegisteredInputValue(locator: Locator, value: string) {
  await locator.evaluate((element, nextValue) => {
    const input = element as HTMLInputElement;
    const valueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value",
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
        "Mobile QA route smoke should not emit page or console errors.",
      ).toEqual({ consoleErrors: [], pageErrors: [] });
    },
  };
}

// 기능 : OCR 실패 API 응답 fixture를 G02 safe failure 계약에 맞게 생성합니다.
function createBusinessCardFailureScan(store: UserWebApiMockStore) {
  return {
    ai: {
      model: "gpt-4.1-mini",
      provider: "openai",
    },
    createdAt: "2026-07-20T09:00:00.000Z",
    extracted: {
      companyFieldName: null,
      companyName: null,
      companyRegionName: null,
      contactDepartmentName: null,
      contactEmail: null,
      contactJobGradeName: null,
      contactMobile: null,
      contactName: null,
    },
    failure: {
      errorCode: "OCR_PARSE_FAILED",
      retryable: true,
      userMessage: "명함을 읽지 못했어요. 다시 찍거나 파일을 바꿔 주세요.",
    },
    id: `business-card-failed-${store.counters["business-card"] + 1}`,
    linked: {
      companyId: null,
      companyResolution: null,
      confirmedAt: null,
      contactId: null,
      contactResolution: null,
    },
    status: "OCR_FAILED",
    updatedAt: "2026-07-20T09:00:00.000Z",
    usage: {
      costCurrency: "USD",
      pendingTimeMs: 128,
      requestCost: null,
      requestToken: null,
      responseCost: null,
      responseToken: null,
      totalCost: null,
      totalToken: null,
    },
  };
}

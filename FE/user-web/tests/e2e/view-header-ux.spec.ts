import { expect, test } from "@playwright/test";
import { seedAuthenticatedSession, setupUserWebApiMocks } from "./support/user-web-api-mocks";

test("keeps the 38px header in one row and previews view controls without network writes", async ({ page }, testInfo) => {
  await setupUserWebApiMocks(page);
  await seedAuthenticatedSession(page);
  await page.route("**/api/users/me/workspaces/*/object-definitions/*/attribute-definitions", (route) =>
    route.fulfill({ json: [
      { id: "attribute-name", title: "이름", type: "Text", icon: null, config: null, isMultiselect: false },
      { id: "attribute-date", title: "날짜", type: "Date", icon: null, config: null, isMultiselect: false },
    ] }),
  );
  await page.route("**/api/users/me/workspaces/*/object-definitions/*/record-definitions*", (route) =>
    route.fulfill({ json: { items: [], pageInfo: { hasNextPage: false, nextCursor: null } } }),
  );
  const viewRequests: string[] = [];
  const writes: string[] = [];
  const errors: string[] = [];
  page.on("request", (request) => {
    // 1. 공통 사이드바의 읽기 요청만 허용하고 헤더 미리보기의 View API 호출은 계속 검증한다.
    const pathname = new URL(request.url()).pathname;
    const isSidebarFavoriteRead = request.method() === "GET" &&
      /^\/api\/users\/me\/sidebar\/workspaces\/[^/]+\/view-favorites$/.test(pathname);
    if (pathname.startsWith("/api/") && !isSidebarFavoriteRead && /view-definitions|view-favorites/.test(pathname)) viewRequests.push(request.url());
    if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method())) writes.push(request.url());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/app");
  await expect(page.locator(".app-page-header:visible")).toHaveCSS("height", "38px");
  await expect(page.locator('[data-testid="view-header-toolbar"]:visible')).toHaveCount(0);

  await page.goto("/app/workspaces/workspace-e2e-001/objects/object-definition-company");
  const header = page.locator(".app-page-header:visible");
  const toolbar = header.getByTestId("view-header-toolbar");
  await expect(header).toHaveCSS("height", "38px");
  await expect(toolbar).toHaveCount(1);
  await expect(header.getByRole("heading", { name: "Company", exact: true })).toBeVisible();
  await toolbar.getByRole("button", { name: "현재 보기 즐겨찾기 등록", exact: true }).click();
  await expect(toolbar.getByRole("button", { name: "현재 보기 즐겨찾기 해제", exact: true })).toHaveAttribute("aria-pressed", "true");
  await toolbar.getByRole("button", { name: "보기 선택", exact: true }).click();
  await toolbar.getByRole("button", { name: "새 보기 만들기", exact: true }).click();
  const createDialog = toolbar.getByRole("dialog", { name: "새 보기 만들기", exact: true });
  await createDialog.getByLabel("보기 이름", { exact: true }).fill("확인할 기록");
  await createDialog.getByRole("button", { name: "생성", exact: true }).click();
  await expect(toolbar.getByRole("button", { name: "보기 선택", exact: true })).toContainText("확인할 기록");
  await expect(toolbar.getByRole("button", { name: "현재 보기 즐겨찾기 등록", exact: true })).toHaveAttribute("aria-pressed", "false");

  await toolbar.getByRole("button", { name: "필터", exact: true }).click();
  const filterDialog = toolbar.getByRole("dialog", { name: "필터", exact: true });
  await filterDialog.getByRole("button", { name: "필터 추가", exact: true }).click();
  await filterDialog.getByLabel("조건 값 입력", { exact: true }).fill("미리보기");
  await page.keyboard.press("Escape");
  await expect(filterDialog).not.toBeVisible();
  await expect(toolbar.getByRole("button", { name: "필터", exact: true })).toBeFocused();

  await toolbar.getByRole("button", { name: "정렬", exact: true }).click();
  const sortDialog = toolbar.getByRole("dialog", { name: "정렬", exact: true });
  await sortDialog.getByRole("button", { name: "정렬 추가", exact: true }).click();
  await sortDialog.getByLabel("정렬 방향", { exact: true }).selectOption("DESC");
  await page.keyboard.press("Escape");

  await toolbar.getByRole("button", { name: "보기 설정", exact: true }).click();
  await toolbar.getByRole("dialog", { name: "보기 설정", exact: true }).getByLabel("이름", { exact: true }).uncheck();
  await page.keyboard.press("Escape");
  for (const width of [1440, 1024]) {
    await page.setViewportSize({ width, height: 900 });
    const box = await header.boundingBox();
    const toolbarBox = await toolbar.boundingBox();
    expect(box?.height).toBe(38);
    expect(toolbarBox?.y).toBeGreaterThanOrEqual(box?.y ?? 0);
    expect((toolbarBox?.y ?? 0) + (toolbarBox?.height ?? 0)).toBeLessThanOrEqual((box?.y ?? 0) + 38);
    await expect(toolbar.getByRole("button", { name: "보기 설정", exact: true })).toBeInViewport();
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.screenshot({ path: testInfo.outputPath("header-ux.png") });
  expect(viewRequests).toEqual([]);
  expect(writes).toEqual([]);
  expect(errors).toEqual([]);
});

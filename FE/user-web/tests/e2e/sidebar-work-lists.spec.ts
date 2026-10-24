import { expect, test } from "@playwright/test";
import {
  seedAuthenticatedSession,
  setupUserWebApiMocks,
} from "./support/user-web-api-mocks";

test.describe("sidebar work lists", () => {
  // 기능 : 실제 조회 경로로 받은 업무 목록의 순서·아이콘·디자인·접힘을 검증합니다.
  test("shows authenticated lists in server order with the managed-item design", async ({ page }) => {
    // 1. 공통 인증 API Mock과 로그인 상태를 준비한다.
    const api = await setupUserWebApiMocks(page);
    await seedAuthenticatedSession(page);
    await page.goto("/app");

    // 2. API가 반환한 순서와 nullable 아이콘의 기본 표시를 확인한다.
    const navigation = page.getByRole("navigation", { name: "Workspace navigation" });
    const lists = navigation.getByRole("list", { name: "업무 목록" });
    const firstRow = lists.getByRole("listitem").first().locator(":scope > *");
    await expect(lists.getByRole("listitem")).toHaveText(["영업 파이프라인", "고객 도입"]);
    await expect(lists.getByRole("listitem").first().locator("svg")).toHaveClass(/lucide-kanban/);
    await expect(lists.getByRole("listitem").last().locator("svg")).toHaveClass(/lucide-box/);
    await expect(firstRow).toHaveCSS("height", "30px");
    await expect(firstRow).toHaveCSS("font-size", "14px");
    await expect(navigation.getByRole("list", { name: "관리 대상" }).getByRole("listitem")).toHaveText(["Company", "Person"]);
    await expect(navigation.getByRole("link", { name: "Company", exact: true })).toBeVisible();
    expect(api.protectedRequestsWithoutAuthorization()).toEqual([]);

    // 3. 관리 항목과 같은 hover 배경·글자·아이콘 색상을 확인한다.
    const managedItem = navigation.getByRole("link", { name: "Person", exact: true });
    await managedItem.hover();
    await expect(managedItem).toHaveCSS("background-color", "rgb(228, 226, 220)");
    const managedColors = await managedItem.evaluate((element) => ({
      background: getComputedStyle(element).backgroundColor,
      text: getComputedStyle(element).color,
    }));
    await firstRow.hover();
    await expect(firstRow).toHaveCSS("background-color", managedColors.background);
    await expect(firstRow).toHaveCSS("color", managedColors.text);
    await expect(firstRow.locator("svg")).toHaveCSS("color", "rgb(107, 114, 128)");

    // 4. 기존 섹션 접기·펼치기를 유지하고 미구현 List 링크를 만들지 않는다.
    await expect(lists.getByRole("link")).toHaveCount(0);
    await navigation.getByRole("button", { name: "업무 목록 닫기", exact: true }).click();
    await expect(lists).toHaveCount(0);
    await navigation.getByRole("button", { name: "업무 목록 열기", exact: true }).click();
    await expect(lists.getByRole("listitem")).toHaveCount(2);

    // 5. 공통 행에서도 관리 항목의 기존 링크 이동과 선택 색상을 유지한다.
    const companyLink = navigation.getByRole("link", { name: "Company", exact: true });
    await companyLink.click();
    await expect(page).toHaveURL(/\/objects\/object-definition-company$/);
    await expect(companyLink).toHaveAttribute("aria-current", "page");
    await expect(companyLink).toHaveCSS("background-color", managedColors.background);
    await expect(companyLink.locator("svg")).toHaveCSS("color", "rgb(107, 114, 128)");
  });

  // 기능 : 로딩 후 빈 업무 목록에 관리 항목처럼 추가 버튼만 표시합니다.
  test("shows the shared skeleton and only add controls for an empty list", async ({ page }) => {
    // 1. 업무 목록 응답만 지연하고 빈 배열을 반환한다.
    await setupUserWebApiMocks(page, {
      delayMs: (request) => request.pathname.endsWith("/lists") ? 2000 : 0,
      store: { sidebarCrmLists: [] },
    });
    await seedAuthenticatedSession(page);
    await page.goto("/app");

    // 2. 관리 항목과 같은 Skeleton을 표시하고 추가 버튼은 숨긴다.
    const navigation = page.getByRole("navigation", { name: "Workspace navigation" });
    const section = navigation.getByRole("button", { name: "업무 목록 닫기", exact: true }).locator("../..");
    await expect(section.locator(".animate-pulse")).toHaveCount(6);
    await expect(navigation.getByRole("button", { name: "업무 목록 추가", exact: true })).toHaveCount(0);

    // 3. 빈 응답에는 안내 행을 추가하지 않고 기존 추가 버튼만 표시한다.
    await expect(section.getByRole("button", { name: "업무 목록 추가", exact: true }).last()).toBeVisible();
    await expect(section.locator(".animate-pulse")).toHaveCount(0);
    await expect(navigation.getByRole("list", { name: "업무 목록" })).toHaveCount(0);
    await expect(section.locator(":scope > div").last()).toHaveText("");
    await expect(section.getByRole("button", { name: "업무 목록 추가", exact: true })).toHaveCount(2);
  });

  // 기능 : 최초 조회 실패에도 관리 항목처럼 오류·재시도 UI 없이 추가 버튼만 표시합니다.
  test("keeps a failed initial query visually empty like managed items", async ({ page }) => {
    await setupUserWebApiMocks(page, { store: { sidebarCrmListsError: true } });
    await seedAuthenticatedSession(page);
    const failedResponse = page.waitForResponse((response) =>
      response.url().endsWith("/lists") && response.status() === 500
    );
    await page.goto("/app");
    await failedResponse;

    // 1. 자동 조회가 끝난 뒤 기존 추가 버튼을 표시한다.
    const navigation = page.getByRole("navigation", { name: "Workspace navigation" });
    const section = navigation.getByRole("button", { name: "업무 목록 닫기", exact: true }).locator("../..");
    await expect(section.getByRole("button", { name: "업무 목록 추가", exact: true }).last()).toBeVisible();

    // 2. 실패 문구·빈 목록 안내·재시도 버튼과 데이터 행을 추가하지 않는다.
    await expect(section.locator(":scope > div").last()).toHaveText("");
    await expect(section.locator(".animate-pulse")).toHaveCount(0);
    await expect(navigation.getByRole("list", { name: "업무 목록" })).toHaveCount(0);
    await expect(navigation.getByRole("button", { name: "다시 시도", exact: true })).toHaveCount(0);
    await expect(navigation.getByRole("alert")).toHaveCount(0);
  });

  // 기능 : Workspace를 전환하면 이전 공간 목록을 섞지 않고 새 목록을 표시합니다.
  test("keeps work-list data separate when switching workspaces", async ({ page }) => {
    await setupUserWebApiMocks(page, {
      store: {
        createdWorkspace: {
          id: "workspace-e2e-002",
          kind: "PERSONAL",
          name: "두 번째 작업 공간",
        },
      },
      delayMs: (request) => request.pathname.endsWith("workspace-e2e-002/lists") ? 2000 : 0,
    });
    await seedAuthenticatedSession(page);
    await page.goto("/app/workspaces/workspace-e2e-001");
    const navigation = page.getByRole("navigation", { name: "Workspace navigation" });
    await expect(navigation.getByText("영업 파이프라인", { exact: true })).toBeVisible();

    // 1. 기존 Workspace 메뉴로 두 번째 공간을 선택한다.
    await page.getByRole("button", { name: "E2E Workspace" }).click();
    await page.getByRole("menuitem", { name: "두 번째 작업 공간", exact: true }).click();
    await expect(page).toHaveURL(/\/app\/workspaces\/workspace-e2e-002$/);

    // 2. 새 공간을 조회하는 동안 이전 공간 목록은 표시하지 않는다.
    const section = navigation.getByRole("button", { name: "업무 목록 닫기", exact: true }).locator("../..");
    await expect(section.locator(".animate-pulse")).toHaveCount(6);
    await expect(navigation.getByText("영업 파이프라인", { exact: true })).toHaveCount(0);
    await expect(navigation.getByRole("list", { name: "업무 목록" }).getByRole("listitem")).toHaveText(["새 공간 업무"]);

    // 3. 이전 공간으로 돌아가도 각 Workspace의 데이터가 유지된다.
    await page.getByRole("button", { name: "두 번째 작업 공간" }).click();
    await page.getByRole("menuitem", { name: "E2E Workspace", exact: true }).click();
    await expect(page).toHaveURL(/\/app\/workspaces\/workspace-e2e-001$/);
    await expect(navigation.getByRole("list", { name: "업무 목록" }).getByRole("listitem")).toHaveText([
      "영업 파이프라인",
      "고객 도입",
    ]);
    await expect(navigation.getByText("새 공간 업무", { exact: true })).toHaveCount(0);
  });
});

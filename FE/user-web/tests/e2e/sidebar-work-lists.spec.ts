import { expect, test } from "@playwright/test";
import {
  seedAuthenticatedSession,
  setupUserWebApiMocks,
  type UserWebApiMockStore,
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
    await expect(lists.getByRole("listitem")).toHaveText(["영업 파이프라인", "고객 도입"]);
    await expect(lists.getByRole("listitem").first().locator("svg")).toHaveClass(/lucide-kanban/);
    await expect(lists.getByRole("listitem").last().locator("svg")).toHaveClass(/lucide-box/);
    await expect(lists.getByRole("listitem").first()).toHaveCSS("height", "30px");
    await expect(lists.getByRole("listitem").first()).toHaveCSS("font-size", "14px");
    await expect(navigation.getByRole("link", { name: "Company", exact: true })).toBeVisible();
    expect(api.protectedRequestsWithoutAuthorization()).toEqual([]);

    // 3. 기존 섹션 접기·펼치기를 유지하고 미구현 List 링크를 만들지 않는다.
    await expect(lists.getByRole("link")).toHaveCount(0);
    await navigation.getByRole("button", { name: "업무 목록 닫기", exact: true }).click();
    await expect(lists).toHaveCount(0);
    await navigation.getByRole("button", { name: "업무 목록 열기", exact: true }).click();
    await expect(lists.getByRole("listitem")).toHaveCount(2);
  });

  // 기능 : 조회 대기 중 Skeleton과 성공한 빈 목록 안내를 구분합니다.
  test("shows loading before an empty work-list response", async ({ page }) => {
    // 1. 업무 목록 응답만 지연하고 빈 배열을 반환한다.
    await setupUserWebApiMocks(page, {
      delayMs: (request) => request.pathname.endsWith("/lists") ? 2000 : 0,
      store: { sidebarCrmLists: [] },
    });
    await seedAuthenticatedSession(page);
    await page.goto("/app");

    // 2. 로딩 중에는 빈 목록 안내와 추가 버튼이 먼저 표시되지 않는다.
    const navigation = page.getByRole("navigation", { name: "Workspace navigation" });
    await expect(navigation.getByRole("status", { name: "업무 목록을 불러오고 있어요." })).toBeVisible();
    await expect(navigation.getByText("아직 업무 목록이 없어요.")).toHaveCount(0);
    await expect(navigation.getByRole("button", { name: "업무 목록 추가", exact: true })).toHaveCount(0);

    // 3. 조회 성공 후 로딩을 해제하고 빈 목록을 안내한다.
    await expect(navigation.getByText("아직 업무 목록이 없어요.")).toBeVisible();
    await expect(navigation.getByRole("status")).toHaveCount(0);
    await expect(navigation.getByRole("list", { name: "업무 목록" })).toHaveCount(0);
  });

  // 기능 : 조회 실패를 빈 목록으로 오인하지 않고 사용자의 재시도로 복구합니다.
  test("recovers a failed list query through the retry action", async ({ page }) => {
    const store: UserWebApiMockStore = { sidebarCrmListsError: true };
    await setupUserWebApiMocks(page, { store });
    await seedAuthenticatedSession(page);
    await page.goto("/app");

    // 1. 실패는 별도 안내를 표시한다.
    const navigation = page.getByRole("navigation", { name: "Workspace navigation" });
    await expect(navigation.getByRole("alert")).toHaveText(/업무 목록을 불러오지 못했어요./);
    await expect(navigation.getByText("아직 업무 목록이 없어요.")).toHaveCount(0);

    // 2. 사용자의 재시도에서 실제 목록 표시로 복구한다.
    store.sidebarCrmListsError = false;
    await navigation.getByRole("button", { name: "다시 시도", exact: true }).click();
    await expect(navigation.getByRole("list", { name: "업무 목록" }).getByRole("listitem")).toHaveText([
      "영업 파이프라인",
      "고객 도입",
    ]);
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
    await expect(navigation.getByRole("status", { name: "업무 목록을 불러오고 있어요." })).toBeVisible();
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

import { expect, test } from "@playwright/test";
import {
  seedAuthenticatedSession,
  setupUserWebApiMocks,
} from "./support/user-web-api-mocks";

test.describe("sidebar view favorites", () => {
  // 기능 : 합의한 최소 응답을 공통 사이드바 행으로 순서대로 표시합니다.
  test("shows favorite View names and nullable icons in server order", async ({ page }) => {
    const api = await setupUserWebApiMocks(page);
    await seedAuthenticatedSession(page);
    await page.goto("/app");

    // 1. 즐겨찾기도 기존 공통 목록과 같은 행 디자인을 사용한다.
    const navigation = page.getByRole("navigation", { name: "Workspace navigation" });
    const favorites = navigation.getByRole("list", { name: "즐겨찾기", exact: true });
    await expect(favorites.getByRole("listitem")).toHaveText(["이번 달 마감", "서울 회사"]);
    const row = favorites.getByRole("listitem").first().locator(":scope > *");
    await expect(row).toHaveCSS("height", "30px");
    await expect(row).toHaveCSS("font-size", "14px");
    await expect(row.locator("svg")).toHaveClass(/lucide-calendar-days/);
    await expect(favorites.getByRole("listitem").last().locator("svg")).toHaveClass(/lucide-box/);
    await expect(navigation.getByRole("list", { name: "업무 목록" })).toBeVisible();
    await expect(navigation.getByRole("link", { name: "Company", exact: true })).toBeVisible();
    await expect(navigation.getByRole("button", { name: "즐겨찾기 추가", exact: true })).toHaveCount(0);
    expect(api.protectedRequestsWithoutAuthorization()).toEqual([]);

    // 2. 기존 접힘 동작을 유지하고 아직 없는 View 화면으로 링크하지 않는다.
    await expect(favorites.getByRole("link")).toHaveCount(0);
    await navigation.getByRole("button", { name: "즐겨찾기 닫기", exact: true }).click();
    await expect(favorites).toHaveCount(0);
    await navigation.getByRole("button", { name: "즐겨찾기 열기", exact: true }).click();
    await expect(favorites.getByRole("listitem")).toHaveCount(2);
  });

  for (const mode of ["empty", "failure"] as const) {
    // 기능 : 빈 응답과 최초 조회 실패 모두 추가 버튼 없이 빈 목록을 표시합니다.
    test(`uses the shared loading and empty UI for ${mode}`, async ({ page }) => {
      await setupUserWebApiMocks(page, {
        delayMs: (request) => request.pathname.endsWith("/view-favorites") ? 2000 : 0,
        store: mode === "empty" ? { sidebarViewFavorites: [] } : { sidebarViewFavoritesError: true },
      });
      await seedAuthenticatedSession(page);
      const response = page.waitForResponse((result) =>
        result.url().endsWith("/view-favorites") && result.status() === (mode === "empty" ? 200 : 500)
      );
      await page.goto("/app");

      // 1. 공통 Skeleton을 사용하고 즐겨찾기 추가 버튼은 표시하지 않는다.
      const navigation = page.getByRole("navigation", { name: "Workspace navigation" });
      const section = navigation.getByRole("button", { name: "즐겨찾기 닫기", exact: true }).locator("../..");
      await expect(section.locator(".animate-pulse")).toHaveCount(6);
      await expect(section.getByRole("button", { name: "즐겨찾기 추가", exact: true })).toHaveCount(0);
      await response;

      // 2. 성공한 빈 배열과 실패 모두 안내·재시도 UI를 추가하지 않는다.
      await expect(section.getByRole("button", { name: "즐겨찾기 추가", exact: true })).toHaveCount(0);
      await expect(section.locator(".animate-pulse")).toHaveCount(0);
      await expect(section.locator(":scope > div").last()).toHaveText("");
      await expect(navigation.getByRole("list", { name: "즐겨찾기", exact: true })).toHaveCount(0);
      await expect(section.getByRole("alert")).toHaveCount(0);
      await expect(section.getByRole("button", { name: "다시 시도", exact: true })).toHaveCount(0);
    });
  }

  // 기능 : Workspace 전환 중과 전환 후 다른 공간의 즐겨찾기를 섞지 않습니다.
  test("separates favorites when the current workspace changes", async ({ page }) => {
    await setupUserWebApiMocks(page, {
      store: { createdWorkspace: { id: "workspace-e2e-002", kind: "PERSONAL", name: "두 번째 작업 공간" } },
      delayMs: (request) => request.pathname.endsWith("workspace-e2e-002/view-favorites") ? 2000 : 0,
    });
    await seedAuthenticatedSession(page);
    await page.goto("/app/workspaces/workspace-e2e-001");
    const navigation = page.getByRole("navigation", { name: "Workspace navigation" });
    await expect(navigation.getByText("이번 달 마감", { exact: true })).toBeVisible();

    // 1. 기존 Workspace 메뉴를 사용해 전환한다.
    await page.getByRole("button", { name: "E2E Workspace" }).click();
    await page.getByRole("menuitem", { name: "두 번째 작업 공간", exact: true }).click();
    await expect(page).toHaveURL(/\/app\/workspaces\/workspace-e2e-002$/);
    const section = navigation.getByRole("button", { name: "즐겨찾기 닫기", exact: true }).locator("../..");
    await expect(section.locator(".animate-pulse")).toHaveCount(6);
    await expect(navigation.getByText("이번 달 마감", { exact: true })).toHaveCount(0);
    await expect(navigation.getByRole("list", { name: "즐겨찾기" }).getByRole("listitem")).toHaveText(["새 공간 즐겨찾기"]);

    // 2. 이전 Workspace로 돌아가도 각각의 목록이 유지된다.
    await page.getByRole("button", { name: "두 번째 작업 공간" }).click();
    await page.getByRole("menuitem", { name: "E2E Workspace", exact: true }).click();
    await expect(page).toHaveURL(/\/app\/workspaces\/workspace-e2e-001$/);
    await expect(navigation.getByRole("list", { name: "즐겨찾기" }).getByRole("listitem")).toHaveText(["이번 달 마감", "서울 회사"]);
    await expect(navigation.getByText("새 공간 즐겨찾기", { exact: true })).toHaveCount(0);
  });
});

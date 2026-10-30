import { test, expect, type Page } from "@playwright/test";
import fixtures from "../fixtures/view-data.json" with { type: "json" };
import { setupViewMenuScenario, MENU_LIST_PATH, VIEW_TYPES } from "./support/view-menu-scenario";
import type { WorkspaceViewType } from "../../src/features/crm-view/types/workspace-view";

// 기능 : 본문 mock은 서버 계산기로 생성한 가상 응답만 사용하고 업무 DB를 변경하지 않습니다.
async function scenario(page: Page, type: WorkspaceViewType) {
  const state = await setupViewMenuScenario(page, type), calls: string[] = [];
  await page.route(/tile\.openstreetmap\.org/, route => route.abort());
  await page.route(/\/view-definitions\/view-[^/]+\/data\?/, async route => {
    const url = new URL(route.request().url()), view = url.pathname.split("/").at(-2)!;
    const headers = { "access-control-allow-origin": route.request().headers().origin ?? "http://127.0.0.1:5175", "access-control-allow-credentials": "true", "access-control-allow-methods": "GET, OPTIONS", "access-control-allow-headers": "Authorization, Content-Type, X-Request-Id" };
    if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers });
    calls.push(view);
    const response = structuredClone(fixtures[view.replace("view-", "").toUpperCase() as WorkspaceViewType]);
    return route.fulfill({ status: 200, json: response, headers });
  });
  return { state, calls };
}

for (const type of VIEW_TYPES) {
  test(`renders ${type} through selected header View ID`, async ({ page }) => {
    const { state, calls } = await scenario(page, type);
    await page.goto(MENU_LIST_PATH);
    await expect(page.locator(`[data-testid="view-${type.toLowerCase()}"]:visible`).first()).toBeVisible();
    expect(calls).toContain(`view-${type.toLowerCase()}`);
    if (type === "CHART" || type === "PIVOT") await expect(page.locator(`[data-testid="view-${type.toLowerCase()}"]:visible`)).toContainText("0.4");
    if (type === "DASHBOARD") { await expect(page.locator('[data-testid="view-table"]:visible')).toBeVisible(); expect(calls.filter(view => view === "view-table")).toHaveLength(1); }
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.locator(`[data-testid="view-${type.toLowerCase()}"]:visible`).first()).toBeVisible();
    expect(state.writes).toEqual([]);
  });
}

test("temporary filter edits leave stored body data unchanged", async ({ page }) => {
  const { calls, state } = await scenario(page, "TABLE");
  await page.goto(MENU_LIST_PATH);
  await expect(page.locator('[data-testid="view-table"]:visible')).toBeVisible();
  const toolbar = page.locator('[data-testid="view-header-toolbar"]:visible');
  await toolbar.getByRole("button", { name: "필터", exact: true }).click();
  await expect(toolbar.getByRole("dialog")).toContainText("저장과 본문 반영은 아직 지원하지 않아요");
  await page.keyboard.press("Escape");
  expect(calls.filter(view => view === "view-table")).toHaveLength(1);
  expect(state.writes).toEqual([]);
});

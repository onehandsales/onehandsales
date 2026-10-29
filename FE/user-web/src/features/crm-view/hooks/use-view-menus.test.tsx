import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, StrictMode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getViewMenu } from "../api/view-menu-api";
import { workspaceViewQueryKeys } from "../api/workspace-view-query-keys";
import type { ViewSettingsResponse } from "../types/view-menu";
import type { WorkspaceViewHeaderModel } from "./use-workspace-view-header";
import { useViewMenus } from "./use-view-menus";

vi.mock("../api/view-menu-api", () => ({ getViewMenu: vi.fn() }));
const request = vi.mocked(getViewMenu);
const settings: ViewSettingsResponse = { viewDefinitionId: "a", viewType: "TABLE", viewName: "A", objectDefinitionId: "target", listDefinitionId: null, configJson: null,
  attributeDefinitions: [], selectOptions: [], statusOptions: [], viewAttributeSettingDefinitions: [], viewGroupDefinitions: [], viewGroupSettingDefinitions: [], viewWidgetDefinitions: [], contentViewDefinitions: [] };
const initialHeader: WorkspaceViewHeaderModel = { userId: "user", workspaceId: "space", targetType: "OBJECT", target: { id: "target", name: "Target", icon: null },
  currentView: { viewDefinitionId: "a", viewType: "TABLE", viewName: "A", viewIcon: null, isSelected: true },
  isFavorite: false, isLoading: false, isError: false, isUnavailable: false, isFavoritePending: false, canToggleFavorite: true, favoriteError: null,
  onToggleFavorite: vi.fn(), onDismissFavoriteError: vi.fn(), onSelect: vi.fn(), onRetry: vi.fn() };

// 기능 : 실제 QueryClient와 StrictMode에서 조회 시점과 임시 입력의 수명을 검증합니다.
describe("useViewMenus", () => {
  let client: QueryClient, root: Root, container: HTMLDivElement, model: ReturnType<typeof useViewMenus>;
  // 기능 : 각 사례의 캐시와 렌더링 자원을 초기화합니다.
  beforeEach(() => {
    request.mockReset().mockResolvedValue(settings);
    client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    container = document.createElement("div"); document.body.append(container); root = createRoot(container);
  });
  // 기능 : 요청과 캐시가 다음 사례에 남지 않게 정리합니다.
  afterEach(async () => { await act(async () => root.unmount()); client.clear(); container.remove(); });
  // 기능 : 같은 hook 인스턴스에 바뀐 헤더를 전달합니다.
  function Probe({ header }: { readonly header: WorkspaceViewHeaderModel }) { model = useViewMenus(header); return null; }
  // 기능 : StrictMode의 실제 mount 동작을 포함해 메뉴 모델을 렌더링합니다.
  async function render(header = initialHeader) {
    await act(async () => { root.render(<StrictMode><QueryClientProvider client={client}><Probe header={header} /></QueryClientProvider></StrictMode>); });
  }
  // 기능 : Query 비동기 알림을 React 갱신으로 반영합니다.
  async function flush() { await act(async () => { await new Promise(resolve => setTimeout(resolve, 10)); }); }

  // 기능 : 메뉴 클릭 전에는 조회하지 않고 편집은 서버 캐시와 분리합니다.
  it("loads on open once and protects drafts from cache refresh and reopening", async () => {
    await render(); expect(request).not.toHaveBeenCalled();
    await act(async () => model.open("settings")); await flush();
    expect(request).toHaveBeenCalledTimes(1);
    await act(async () => model.settings.change({ ...settings, viewName: "Draft" }));
    await act(async () => { model.open(null); client.setQueryData(workspaceViewQueryKeys.menu("user", "space", "a", "settings"), { ...settings, viewName: "Refreshed" }); });
    await act(async () => model.open("settings")); await flush();
    expect(model.settings.data?.viewName).toBe("Draft");
    expect(request).toHaveBeenCalledTimes(1);
    expect(client.getQueryData<ViewSettingsResponse>(workspaceViewQueryKeys.menu("user", "space", "a", "settings"))?.viewName).toBe("Refreshed");
  });
  // 기능 : 보기 이동 후 돌아와도 이전 임시 입력을 복원하지 않습니다.
  it("discards drafts across view, user and workspace changes", async () => {
    await render(); await act(async () => model.open("settings")); await flush();
    await act(async () => model.settings.change({ ...settings, viewName: "Draft" }));
    await render({ ...initialHeader, currentView: { ...initialHeader.currentView!, viewDefinitionId: "b" } });
    expect(model.settings.data).toBeUndefined();
    await render();
    expect(model.settings.data?.viewName).toBe("A");
    await render({ ...initialHeader, userId: "other" }); expect(model.settings.data).toBeUndefined();
    await render({ ...initialHeader, workspaceId: "other" }); expect(model.settings.data).toBeUndefined();
  });
  // 기능 : 늦게 도착한 이전 보기의 응답을 새로운 메뉴에 적용하지 않습니다.
  it("aborts a closed request and ignores its late result after switching", async () => {
    let resolve!: (value: ViewSettingsResponse) => void;
    request.mockReturnValue(new Promise<ViewSettingsResponse>(done => { resolve = done; }));
    await render(); await act(async () => model.open("settings"));
    const signal = request.mock.calls[0]![3];
    await render({ ...initialHeader, currentView: { ...initialHeader.currentView!, viewDefinitionId: "b" } });
    expect(signal.aborted).toBe(true);
    await act(async () => resolve(settings)); await flush();
    expect(model.settings.data).toBeUndefined();
  });
  // 기능 : View가 없는 헤더에는 임의 ID로 메뉴 조회를 보내지 않습니다.
  it("does not request menus without a current view", async () => {
    await render({ ...initialHeader, currentView: null });
    await act(async () => model.open("settings")); await flush();
    expect(request).not.toHaveBeenCalled();
  });
});

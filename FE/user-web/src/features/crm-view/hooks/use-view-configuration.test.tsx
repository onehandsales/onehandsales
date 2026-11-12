import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, StrictMode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiClientError } from "@/lib/api-client";
import { getViewConfiguration, updateViewConfiguration } from "../api/view-configuration-api";
import type { ViewConfigurationResponse } from "../types/view-configuration";
import type { WorkspaceViewHeaderModel } from "./use-workspace-view-header";
import { useViewMenus } from "./use-view-menus";

vi.mock("../api/view-configuration-api", () => ({ getViewConfiguration: vi.fn(), updateViewConfiguration: vi.fn() }));
const get = vi.mocked(getViewConfiguration), update = vi.mocked(updateViewConfiguration);
const base = { viewDefinitionId: "view", viewType: "TABLE" as const, attributeDefinitions: [] };
const configuration: ViewConfigurationResponse = {
  configurationVersion: "v1", candidates: [],
  filters: { ...base, viewFilterGroupDefinitions: [], viewFilterConditionDefinitions: [], selectOptions: [], statusOptions: [] },
  sorts: { ...base, viewSortDefinitions: [] },
  settings: { ...base, viewName: "회사", objectDefinitionId: "object", listDefinitionId: null, configJson: null, selectOptions: [], statusOptions: [],
    viewAttributeSettingDefinitions: [{ id: "column", attributeDefinitionId: "name", sourceScope: "RECORD", referenceAttributeIdPathJson: [], attributeDisplayRole: "TITLE", sortOrder: 0, labelOverride: null, width: null, isHidden: false, formatJson: null }],
    viewGroupDefinitions: [], viewGroupSettingDefinitions: [], viewWidgetDefinitions: [], contentViewDefinitions: [] },
};
const header: WorkspaceViewHeaderModel = { userId: "user", workspaceId: "workspace", targetType: "OBJECT", target: { id: "object", name: "회사", icon: null },
  currentView: { viewDefinitionId: "view", viewType: "TABLE", viewName: "회사", viewIcon: null, isSelected: true },
  isFavorite: false, isLoading: false, isError: false, isUnavailable: false, isFavoritePending: false, canToggleFavorite: true, favoriteError: null,
  onToggleFavorite: vi.fn(), onDismissFavoriteError: vi.fn(), onSelect: vi.fn(), onRetry: vi.fn() };

// 기능 : 실제 캐시와 React 상태에서 저장·되돌리기·충돌 및 보기 이동을 검증합니다.
describe("View configuration drafts", () => {
  let client: QueryClient, root: Root, container: HTMLDivElement, model: ReturnType<typeof useViewMenus>;
  beforeEach(() => {
    get.mockReset().mockResolvedValue(structuredClone(configuration)); update.mockReset();
    client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    container = document.createElement("div"); document.body.append(container); root = createRoot(container);
  });
  afterEach(async () => { await act(async () => root.unmount()); client.clear(); container.remove(); });
  // 기능 : 저장 지원 보기에 공통 메뉴 hook을 연결합니다.
  function Probe({ value }: { readonly value: WorkspaceViewHeaderModel }) { model = useViewMenus(value); return null; }
  // 기능 : 조회 알림을 포함하여 렌더링을 완료합니다.
  async function render(value = header) {
    await act(async () => { root.render(<StrictMode><QueryClientProvider client={client}><Probe value={value} /></QueryClientProvider></StrictMode>); });
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 15)); });
  }
  it("loads one coherent baseline and keeps all edits local until save", async () => {
    await render(); expect(model.isConfigurationReady).toBe(true);
    await act(async () => model.changeColumn("column", { labelOverride: "고객사", width: 250 }));
    await act(async () => model.sorts.change({ ...configuration.sorts, viewSortDefinitions: [{ id: "sort", attributeDefinitionId: "name", sourceScope: "RECORD", referenceAttributeIdPathJson: [], sortDirection: "DESC", sortOrder: 0, configJson: null }] }));
    await act(async () => model.filters.change({ ...configuration.filters, viewFilterGroupDefinitions: [{ id: "group", parentViewFilterGroupDefinitionId: null, conditionGroupOperator: "AND", sortOrder: 0 }] }));
    await act(async () => { model.open("settings"); model.open(null); });
    expect(update).not.toHaveBeenCalled(); expect(model.command?.baseConfigurationVersion).toBe("v1");
    expect(Object.keys(model.command!.changes).sort()).toEqual(["filters", "settings", "sorts"]);
    expect(model.settings.data?.viewAttributeSettingDefinitions[0]?.labelOverride).toBe("고객사");
    await act(async () => model.discard());
    expect(model.isDirty).toBe(false); expect(model.command).toBeUndefined();
    expect(model.settings.data?.viewAttributeSettingDefinitions[0]?.labelOverride).toBeNull();
  });
  it("retains edits on conflict and only replaces them when latest is chosen", async () => {
    await render(); await act(async () => model.changeColumn("column", { labelOverride: "고객사" }));
    update.mockRejectedValue(new ApiClientError({ message: "conflict", statusCode: 409, code: "ViewConfigurationConflict", raw: null }));
    await act(async () => model.save());
    expect(model.isDirty).toBe(true); expect(model.isConflict).toBe(true);
    get.mockResolvedValue({ ...configuration, configurationVersion: "v2" });
    await act(async () => model.useLatest());
    expect(model.isDirty).toBe(false); expect(model.isConflict).toBe(false);
  });
  it("saves only changed sections and accepts the returned version", async () => {
    await render(); await act(async () => model.changeColumn("column", { labelOverride: "고객사" }));
    update.mockResolvedValue({ ...configuration, configurationVersion: "v2", settings: model.settings.data! });
    await act(async () => model.save());
    expect(update.mock.calls[0]?.[1].changes).toEqual({ settings: expect.objectContaining({ viewAttributeSettingDefinitions: expect.any(Array) }) });
    expect(model.isDirty).toBe(false); expect(model.isSaved).toBe(true);
    await act(async () => model.changeColumn("column", { width: 300 }));
    expect(model.command?.baseConfigurationVersion).toBe("v2");
  });
  it("ignores a completed save from the previous view", async () => {
    await render(); await act(async () => model.changeColumn("column", { labelOverride: "Old draft" }));
    let resolve!: (value: ViewConfigurationResponse) => void;
    update.mockReturnValue(new Promise(done => { resolve = done; }));
    let pending!: Promise<void>;
    await act(async () => { pending = model.save(); });
    await render({ ...header, currentView: { ...header.currentView!, viewDefinitionId: "other" } });
    await act(async () => { resolve({ ...configuration, configurationVersion: "v2" }); await pending; });
    expect(model.isDirty).toBe(false); expect(model.isSaved).toBe(false);
    expect(model.settings.data?.viewAttributeSettingDefinitions[0]?.labelOverride).toBeNull();
  });
  it("allows another view to edit and save while the previous save is pending", async () => {
    await render(); await act(async () => model.changeColumn("column", { labelOverride: "First" }));
    let resolveFirst!: (value: ViewConfigurationResponse) => void;
    let resolveSecond!: (value: ViewConfigurationResponse) => void;
    update.mockImplementationOnce(() => new Promise(done => { resolveFirst = done; }))
      .mockImplementationOnce(() => new Promise(done => { resolveSecond = done; }));
    let first!: Promise<void>, second!: Promise<void>;
    await act(async () => { first = model.save(); });
    await render({ ...header, currentView: { ...header.currentView!, viewDefinitionId: "other" } });
    await act(async () => model.changeColumn("column", { labelOverride: "Second" }));
    expect(model.isDirty).toBe(true);
    await act(async () => { second = model.save(); });
    expect(model.isSaving).toBe(true);
    const secondDataKey = ["crm-view", "user", "workspace", "data", "OBJECT", "object", "other"];
    client.setQueryData(secondDataKey, { preserved: true });
    await act(async () => { resolveFirst({ ...configuration, configurationVersion: "v2" }); await first; });
    expect(model.isSaving).toBe(true);
    expect(model.settings.data?.viewAttributeSettingDefinitions[0]?.labelOverride).toBe("Second");
    expect(client.getQueryData(secondDataKey)).toEqual({ preserved: true });
    await act(async () => { resolveSecond({ ...configuration, configurationVersion: "v3", settings: model.settings.data! }); await second; });
    expect(model.isSaving).toBe(false); expect(model.isDirty).toBe(false);
  });
  it("keeps a returning view locked until its own save finishes without restoring the old visit's status", async () => {
    await render(); await act(async () => model.changeColumn("column", { labelOverride: "First" }));
    let resolve!: (value: ViewConfigurationResponse) => void;
    update.mockReturnValue(new Promise(done => { resolve = done; }));
    let pending!: Promise<void>;
    await act(async () => { pending = model.save(); });
    await render({ ...header, currentView: { ...header.currentView!, viewDefinitionId: "other" } });
    await render();
    expect(model.isSaving).toBe(true);
    await act(async () => { resolve({ ...configuration, configurationVersion: "v2" }); await pending; });
    expect(model.isSaving).toBe(false); expect(model.isSaved).toBe(false);
    await act(async () => model.changeColumn("column", { labelOverride: "New visit" }));
    expect(model.command?.baseConfigurationVersion).toBe("v2");
  });
  it("does not discard edits made while the latest configuration is loading", async () => {
    await render(); await act(async () => model.changeColumn("column", { labelOverride: "Before reload" }));
    let resolve!: (value: ViewConfigurationResponse) => void;
    get.mockReturnValue(new Promise(done => { resolve = done; }));
    let pending!: Promise<void>;
    await act(async () => { pending = model.useLatest(); });
    await act(async () => model.changeColumn("column", { labelOverride: "During reload" }));
    await act(async () => { resolve({ ...configuration, configurationVersion: "v2" }); await pending; });
    expect(model.isDirty).toBe(true);
    expect(model.settings.data?.viewAttributeSettingDefinitions[0]?.labelOverride).toBe("During reload");
  });
});

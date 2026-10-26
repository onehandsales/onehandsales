import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createWorkspaceViewFavorite, deleteWorkspaceViewFavorite,
  sidebarViewFavoriteQueryKeys, type ViewFavoriteResponse,
} from "@/features/view-favorite";
import { ApiClientError } from "@/lib/api-client";
import { workspaceViewQueryKeys } from "../api/workspace-view-query-keys";
import type { WorkspaceViewHeaderResponse } from "../types/workspace-view";
import { useWorkspaceViewFavorite } from "./use-workspace-view-favorite";

vi.mock("@/features/view-favorite", async importOriginal => ({
  ...await importOriginal<typeof import("@/features/view-favorite")>(),
  createWorkspaceViewFavorite: vi.fn(), deleteWorkspaceViewFavorite: vi.fn(),
}));
const create = vi.mocked(createWorkspaceViewFavorite), remove = vi.mocked(deleteWorkspaceViewFavorite);
type Options = Parameters<typeof useWorkspaceViewFavorite>[0];
const OPTIONS: Options = { userId: "user", workspaceId: "space", viewId: "view", serverIsFavorite: false, serverUpdatedAt: 1, enabled: true };
const HEADER: WorkspaceViewHeaderResponse = { viewId: "view", viewName: "All", viewIcon: null, viewType: "TABLE", isFavorite: false, objectDefinition: { id: "target", name: "Company", icon: null }, listDefinition: null };

// 기능 : 제어 가능한 API 응답으로 실제 React hook·QueryClient의 상태 경계를 검증합니다.
describe("useWorkspaceViewFavorite", () => {
  let client: QueryClient, root: Root, container: HTMLDivElement;
  let model: ReturnType<typeof useWorkspaceViewFavorite>;

  // 기능 : 각 사례의 실제 Query 캐시와 React 렌더링 자원을 분리합니다.
  beforeEach(() => {
    create.mockReset().mockResolvedValue({ viewId: "view", isFavorite: true });
    remove.mockReset().mockResolvedValue({ viewId: "view", isFavorite: false });
    client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    container = document.createElement("div"); document.body.append(container); root = createRoot(container);
  });

  // 기능 : 캐시와 React 트리를 정리해 다음 사용자·범위 테스트에 영향을 주지 않습니다.
  afterEach(async () => { await act(async () => root.unmount()); client.clear(); container.remove(); });

  // 기능 : 조건 변경 전후에도 같은 hook 인스턴스로 늦은 응답을 검사합니다.
  function Probe({ options }: { readonly options: Options }) { model = useWorkspaceViewFavorite(options); return null; }

  // 기능 : React 갱신과 mutation callback이 적용될 때까지 현재 입력을 렌더링합니다.
  async function render(options: Options = OPTIONS) {
    await act(async () => { root.render(<QueryClientProvider client={client}><Probe options={options} /></QueryClientProvider>); });
  }

  // 기능 : 네트워크 완료 후 React와 Query 알림을 같은 act 범위에서 반영합니다.
  async function flush() { await act(async () => { await new Promise(resolve => setTimeout(resolve, 10)); }); }

  // 기능 : 쓰기 중 선택 변경과 재클릭을 재현할 지연 응답을 만듭니다.
  function gate() {
    let resolve!: (response: ViewFavoriteResponse) => void;
    let reject!: (error: Error) => void;
    const promise = new Promise<ViewFavoriteResponse>((done, fail) => { resolve = done; reject = fail; });
    return { promise, resolve, reject };
  }

  // 기능 : 같은 View의 헤더만 갱신하고 다른 사용자·Workspace·View와 목록 PK를 보존합니다.
  it("updates only matching headers and invalidates only the originating personal list", async () => {
    const own = workspaceViewQueryKeys.header("user", "space", "OBJECT", "target");
    const sameView = workspaceViewQueryKeys.header("user", "space", "LIST", "list");
    const differentView = workspaceViewQueryKeys.header("user", "space", "OBJECT", "other");
    const differentUser = workspaceViewQueryKeys.header("other", "space", "OBJECT", "target");
    const differentSpace = workspaceViewQueryKeys.header("user", "other", "OBJECT", "target");
    for (const key of [own, sameView, differentUser, differentSpace]) client.setQueryData(key, HEADER);
    client.setQueryData(differentView, { ...HEADER, viewId: "other" });
    const ownSidebar = sidebarViewFavoriteQueryKeys.list("user", "space"), otherSidebar = sidebarViewFavoriteQueryKeys.list("other", "space");
    client.setQueryData(ownSidebar, []); client.setQueryData(otherSidebar, []);
    await render(); await act(async () => { model.onToggle(); }); await flush();
    expect(model.isFavorite).toBe(true);
    for (const key of [own, sameView]) expect(client.getQueryData(key)).toMatchObject({ isFavorite: true });
    for (const key of [differentView, differentUser, differentSpace]) expect(client.getQueryData(key)).toMatchObject({ isFavorite: false });
    expect(client.getQueryData(ownSidebar)).toEqual([]);
    expect(client.getQueryState(ownSidebar)?.isInvalidated).toBe(true);
    expect(client.getQueryState(otherSidebar)?.isInvalidated).toBe(false);
  });

  // 기능 : 알려진 등록 상태일 때 View ID로 해제하고 성공 응답의 false를 표시합니다.
  it("deletes an existing favorite and preserves the confirmed state until a newer read", async () => {
    await render({ ...OPTIONS, serverIsFavorite: true });
    await act(async () => { model.onToggle(); }); await flush();
    expect(remove).toHaveBeenCalledWith("space", "view");
    expect(model.isFavorite).toBe(false);
    await render({ ...OPTIONS, serverIsFavorite: true, serverUpdatedAt: Date.now() + 1000 });
    expect(model.isFavorite).toBe(true);
  });

  // 기능 : 경로 UUID가 대문자여도 canonical 응답과 개인 목록 캐시를 같은 범위로 처리합니다.
  it("uses canonical UUID scopes for response application and personal invalidation", async () => {
    const workspaceId = "00000000-0000-4000-8000-000000000abc", viewId = "00000000-0000-4000-8000-000000000def";
    const headerKey = workspaceViewQueryKeys.header("user", workspaceId, "OBJECT", "target");
    const favoriteKey = sidebarViewFavoriteQueryKeys.list("user", workspaceId);
    client.setQueryData(headerKey, { ...HEADER, viewId }); client.setQueryData(favoriteKey, []);
    create.mockResolvedValue({ viewId, isFavorite: true });
    await render({ ...OPTIONS, workspaceId: workspaceId.toUpperCase(), viewId: viewId.toUpperCase() });
    await act(async () => { model.onToggle(); }); await flush();
    expect(model.isFavorite).toBe(true);
    expect(client.getQueryData(headerKey)).toMatchObject({ isFavorite: true });
    expect(client.getQueryState(favoriteKey)?.isInvalidated).toBe(true);
  });

  // 기능 : 빈 보기·미확인 상태·접근 불가한 헤더는 API 요청을 시작하지 않습니다.
  it.each([
    { viewId: null }, { serverIsFavorite: null }, { enabled: false }, { userId: null },
  ])("does not mutate unavailable input %j", async change => {
    await render({ ...OPTIONS, ...change });
    await act(async () => { model.onToggle(); }); await flush();
    expect(model.canToggle).toBe(false);
    expect(create).not.toHaveBeenCalled(); expect(remove).not.toHaveBeenCalled();
  });

  // 기능 : React 갱신 전 연속 클릭도 한 번만 전송하고 실패 시 기존 상태를 유지합니다.
  it("blocks duplicate requests and exposes a safe error without optimistic changes", async () => {
    const pending = gate(); create.mockReturnValue(pending.promise);
    await render();
    await act(async () => { model.onToggle(); model.onToggle(); }); await flush();
    expect(create).toHaveBeenCalledTimes(1); expect(model.isPending).toBe(true); expect(model.isFavorite).toBe(false);
    await act(async () => { pending.reject(new Error("private failure")); }); await flush();
    expect(model.isFavorite).toBe(false); expect(model.error).toBe("SAVE_FAILED"); expect(model.canToggle).toBe(true);
    await act(async () => { model.onDismissError(); });
    expect(model.error).toBeNull();
  });

  // 기능 : 사용자·Workspace·View가 바뀐 뒤 늦은 성공/실패가 새 화면을 바꾸지 않습니다.
  it.each(["userId", "workspaceId", "viewId"] as const)("isolates a late response after changing %s", async field => {
    const pending = gate(); create.mockReturnValue(pending.promise);
    const old = workspaceViewQueryKeys.header("user", "space", "OBJECT", "target"); client.setQueryData(old, HEADER);
    await render(); await act(async () => { model.onToggle(); }); await flush();
    await render({ ...OPTIONS, [field]: "other" });
    await act(async () => { pending.resolve({ viewId: "view", isFavorite: true }); }); await flush();
    expect(model.isFavorite).toBe(false); expect(model.error).toBeNull(); expect(model.isPending).toBe(false);
    expect(client.getQueryData(old)).toMatchObject({ isFavorite: true });
  });

  // 기능 : 대상/권한 오류 안내를 닫아도 해당 보기로 잘못된 쓰기를 반복하지 않습니다.
  it.each([403, 404])("keeps a rejected view disabled after dismissing status %s", async status => {
    create.mockRejectedValue(new ApiClientError({ statusCode: status, code: "NotFound", message: "private message", raw: null }));
    await render(); await act(async () => { model.onToggle(); }); await flush();
    expect(model.error).toBe("UNAVAILABLE"); expect(model.canToggle).toBe(false);
    await act(async () => { model.onDismissError(); model.onToggle(); });
    expect(model.error).toBeNull(); expect(model.canToggle).toBe(false); expect(create).toHaveBeenCalledTimes(1);
  });
});

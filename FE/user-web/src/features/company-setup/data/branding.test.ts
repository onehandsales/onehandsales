import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPreviewRuntime } from "@/mocks/create-preview-runtime";
import { createAuthStore } from "@/features/mock-auth";
import type { HeaderPreset } from "@/features/document-branding/model/branding-types";
import { createCompanyStore } from "./create-company-store";
import type { PreviewScope } from "@/features/preview/model/preview-types";
// 기능 : 같은 메모리 회사와 실행 문맥에서 브랜드·회사 저장의 경계를 준비한다.
function setup() {
  const preview = createPreviewRuntime(); const auth = createAuthStore(preview); auth.connect(); const store = createCompanyStore(preview, auth); store.connect(); preview.setSession("preview-a");
  const scope: PreviewScope = { actorId: "preview-a", workspaceId: "studio-a", revision: preview.getSnapshot().revision };
  // 기능 : 저장된 회사 revision과 브랜드 revision으로 현재 초안을 만든다.
  function draft(header: HeaderPreset) { const company = store.company(scope.workspaceId); if (!company) throw new Error("Fixture missing"); return { defaults: { ...company.branding, header }, logo: company.logo, brandRevision: company.brandingRevision, companyRevision: company.settingsRevision, logoChanged: false }; }
  return { preview, store, scope, draft };
}
// 기능 : 독립 저장 요청의 취소 신호를 만든다.
function signal() { return new AbortController().signal; }
// 기능 : 실제 목 지연을 가짜 시계로 진행하면서 성공·실패를 빠뜨리지 않고 수신한다.
async function finish<T>(request: Promise<T>) { const handled = request.then(value => ({ value }), error => ({ error })); await vi.runAllTimersAsync(); const result = await handled; if ("error" in result) throw result.error; return result.value; }
beforeEach(function mockClock() { vi.useFakeTimers(); });
afterEach(function restoreClock() { vi.useRealTimers(); });
describe("document brand defaults", () => {
  it("copies saved defaults on document creation and never mutates existing invoice/proposal/contract snapshots", async () => {
    const { store, scope, draft } = setup();
    const existing = ["invoice", "proposal", "contract"].map(kind => ({ id: kind + "-old", kind, brand: store.snapshotDocumentBranding(scope) }));
    const unsaved = draft("abstract"); expect(store.snapshotDocumentBranding(scope).defaults.header).toBe("none");
    await finish(store.saveBranding(scope, unsaved, signal())); const created = store.snapshotDocumentBranding(scope);
    await finish(store.saveBranding(scope, draft("plant"), signal()));
    expect(existing.map(item => item.brand.defaults.header)).toEqual(["none", "none", "none"]); expect(created.defaults.header).toBe("abstract");
    expect(store.snapshotDocumentBranding(scope)).toMatchObject({ companyId: "company-studio-a", defaultsRevision: 2, defaults: { header: "plant" } });
    created.defaults.header = "none"; expect(store.snapshotDocumentBranding(scope).defaults.header).toBe("plant");
  });
  it("preserves unrelated company edits and prevents old company snapshots from replacing newer branding", async () => {
    const { store, scope, draft, preview } = setup(); const oldCompany = store.company(scope.workspaceId); if (!oldCompany) throw new Error("Fixture missing"); const brand = draft("plant");
    const company = await finish(store.saveSettings(scope, { ...oldCompany, name: "Company 최신", country: "Singapore", currency: "USD", publicProfile: false, slug: "saved-profile", address: { line1: "New address", line2: "", city: "", region: "", postal: "" } }, 0, signal()));
    await finish(store.saveBranding(scope, brand, signal()));
    await finish(store.saveSettings(scope, { ...company, name: "Company after branding" }, company.settingsRevision, signal()));
    expect(store.company(scope.workspaceId)).toMatchObject({ name: "Company after branding", country: "Singapore", currency: "USD", publicProfile: false, slug: "saved-profile", branding: { header: "plant" }, brandingRevision: 1, address: { line1: "New address" } });
    expect(preview.getSnapshot().revision).toBe(scope.revision);
  });
  it("rejects a stale logo edit atomically, retains input after failure and commits a repeated save only once", async () => {
    const { store, scope, draft } = setup(); const old = { ...draft("abstract"), logoChanged: true }; const company = store.company(scope.workspaceId); if (!company) throw new Error("Fixture missing");
    await finish(store.saveSettings(scope, { ...company, name: "Latest company" }, 0, signal()));
    await expect(finish(store.saveBranding(scope, old, signal()))).rejects.toThrow("changed"); expect(store.company(scope.workspaceId)?.branding.header).toBe("none");
    const value = { ...draft("plant"), logoChanged: true }; store.setSettingsScenario("save-error");
    await expect(finish(store.saveBranding(scope, value, signal()))).rejects.toThrow("still here"); expect(value.defaults.header).toBe("plant");
    const results = Promise.allSettled([store.saveBranding(scope, value, signal()), store.saveBranding(scope, value, signal())]); await vi.runAllTimersAsync(); expect((await results).map(item => item.status)).toEqual(["fulfilled", "rejected"]);
    expect(store.company(scope.workspaceId)).toMatchObject({ name: "Latest company", settingsRevision: 2, brandingRevision: 1 });
  });
  it("cancels late writes across signal/workspace/logout and keeps saved defaults until Reset", async () => {
    const { store, scope, draft, preview } = setup(); await finish(store.saveBranding(scope, draft("plant"), signal()));
    const controller = new AbortController(); const cancelled = store.saveBranding(scope, draft("abstract"), controller.signal); controller.abort(); await expect(finish(cancelled)).rejects.toMatchObject({ name: "AbortError" });
    const late = store.saveBranding(scope, draft("abstract"), signal()); preview.setWorkspace("studio-a-two"); await expect(finish(late)).rejects.toMatchObject({ name: "AbortError" });
    expect(store.company("studio-a-two")?.branding.header).toBe("none"); preview.setSession(null); expect(store.company("studio-a")?.branding.header).toBe("plant"); preview.reset(); expect(store.company("studio-a")?.branding.header).toBe("none");
  });
  it("rejects member writes and unavailable crown settings without altering roles or public profile", async () => {
    const { store, scope, draft, preview } = setup(); const invalid = { ...draft("none"), defaults: { ...draft("none").defaults, color: "#000000" } };
    // 이유 : 타입 외부의 잘못된 입력도 저장 경계에서 거부되는지 확인한다.
    await expect(finish(store.saveBranding(scope, invalid as ReturnType<typeof draft>, signal()))).rejects.toThrow("not available");
    preview.setSession("preview-b"); const other: PreviewScope = { actorId: "preview-b", workspaceId: "studio-b", revision: preview.getSnapshot().revision };
    await expect(finish(store.saveBranding(other, draft("plant"), signal()))).rejects.toThrow("owner"); expect(store.company("studio-b")?.publicProfile).toBe(true); expect(preview.getSnapshot().session?.role).toBe("member");
  });
});

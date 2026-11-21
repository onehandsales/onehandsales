import { describe, expect, it } from "vitest";
import { createPreviewRuntime } from "@/mocks/create-preview-runtime";
import { createClientStore } from "./create-client-store";
// 기능 : 독립 고객 저장소와 현재 목 workspace를 준비한다.
function setup() { const runtime = createPreviewRuntime(); const store = createClientStore(runtime); store.connect(); runtime.setSession("preview-a"); return { runtime, store }; }
// 기능 : 작업 시작 순간의 현재 실행 차수를 고정한다.
function scope(runtime: ReturnType<typeof createPreviewRuntime>) { const state = runtime.getSnapshot(); return { actorId: state.session!.id, workspaceId: state.workspaceId!, revision: state.revision }; }
// 기능 : 각 테스트 요청에 취소 가능한 기본 신호를 제공한다.
function signal() { return new AbortController().signal; }
const draft = { companyName: "Same company", contactName: "Jane", email: "same@example.test", tagIds: [] };
describe("G19 customer ownership and creation", () => {
  it("creates a company and distinct primary contact once per submission, without merging names or emails", async () => {
    const { runtime, store } = setup(); const first = store.create(scope(runtime), draft, "one", signal()); const repeated = store.create(scope(runtime), draft, "one", signal()); const [a,b] = await Promise.all([first,repeated]); expect(a.id).toBe(b.id);
    const other = await store.create(scope(runtime), { ...draft, companyName: "" }, "two", signal()); expect(other.id).not.toBe(a.id); expect(other).toMatchObject({ companyName: "", displayName: "Jane" }); expect(other.defaultContactId).not.toBe(a.defaultContactId);
    const data = await store.read(scope(runtime), signal()); expect(data.clients).toHaveLength(4); expect(data.contacts.find(contact => contact.id === a.defaultContactId)?.email).toBe(draft.email); data.clients[0]!.displayName = "Bad copy"; expect((await store.read(scope(runtime), signal())).clients[0]!.displayName).toBe("Doe Company");
  });
  it("keeps failed and invalid submissions atomic, retries unchanged input, and rejects foreign tags", async () => {
    const { runtime, store } = setup(); store.setScenario("write-error"); await expect(store.create(scope(runtime), draft, "one", signal())).rejects.toThrow("inputs are preserved"); expect((await store.read(scope(runtime), signal())).clients).toHaveLength(2);
    await store.create(scope(runtime), draft, "one", signal()); await expect(store.create(scope(runtime), { ...draft, email: "bad" }, "invalid", signal())).rejects.toThrow("valid email"); await expect(store.create(scope(runtime), { ...draft, tagIds: ["other:tag"] }, "foreign", signal())).rejects.toThrow("workspace"); expect((await store.read(scope(runtime), signal())).clients).toHaveLength(3);
  });
  it("aborts late writes on cancel, account/workspace switch and reset, preserving saved values only within the memory lifetime", async () => {
    const { runtime, store } = setup(); const a = await store.create(scope(runtime), draft, "saved", signal()); store.setScenario("slow"); const controller = new AbortController(); const cancelled = store.create(scope(runtime), draft, "cancel", controller.signal); controller.abort(); await expect(cancelled).rejects.toMatchObject({ name: "AbortError" });
    const pending = store.create(scope(runtime), draft, "late", signal()); runtime.setWorkspace("studio-a-two"); await expect(pending).rejects.toMatchObject({ name: "AbortError" }); expect((await store.read(scope(runtime), signal())).clients.map(client => client.id)).not.toContain(a.id);
    runtime.setSession(null); runtime.setSession("preview-a"); expect((await store.read(scope(runtime), signal())).clients.map(client => client.id)).toContain(a.id); store.setScenario("slow"); const reset = store.create(scope(runtime), draft, "reset", signal()); runtime.reset(); await expect(reset).rejects.toMatchObject({ name: "AbortError" }); runtime.setSession("preview-a"); expect((await store.read(scope(runtime), signal())).clients).toHaveLength(2);
  });
  it("denies invitation members in the store and separates empty/read-error states from missing customer data", async () => {
    const { runtime, store } = setup(); store.setScenario("read-error"); await expect(store.read(scope(runtime), signal())).rejects.toMatchObject({ kind: "read" }); expect((await store.read(scope(runtime), signal())).clients).toHaveLength(2); store.setScenario("empty"); expect((await store.read(scope(runtime), signal())).clients).toHaveLength(0); store.setScenario("normal");
    runtime.openSession({ id: "preview-b", name: "Invited", role: "member", workspaces: [{ id: "studio-a", name: "Studio" }], memberships: { "studio-a": { role: "member", invitation: { teamRowId: "invite", role: "Collaborator", projectIds: [], allProjects: false } } } }); await expect(store.read(scope(runtime), signal())).rejects.toMatchObject({ kind: "denied" }); await expect(store.create(scope(runtime), draft, "denied", signal())).rejects.toMatchObject({ kind: "denied" });
  });
});

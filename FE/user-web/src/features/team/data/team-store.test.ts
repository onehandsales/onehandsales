import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { createPreviewRuntime } from "@/mocks/create-preview-runtime";
import { createTeamStore } from "./create-team-store";
import type { PreviewScope } from "@/features/preview/model/preview-types";
import type { InviteDraft } from "../model/team-types";
// 기능 : 독립 실행 문맥과 팀 저장소를 연결해 실제 메모리 저장 경계를 검사한다.
function setup() { const runtime = createPreviewRuntime(); const store = createTeamStore(runtime); const disconnect = store.connect(); runtime.setSession("preview-a"); const scope: PreviewScope = { actorId: "preview-a", workspaceId: "studio-a", revision: runtime.getSnapshot().revision }; return { runtime, store, scope, disconnect }; }
// 기능 : 가상 지연을 끝내고 결과를 기다리되 최초 거부도 즉시 관찰한다.
async function settle<T>(promise: Promise<T>) { const result = promise.then(value => ({ value }), error => ({ error })); await vi.runAllTimersAsync(); return result; }
const draft: InviteDraft = { email: "  NEW@EXAMPLE.TEST ", role: "Collaborator", projectIds: ["studio-a:team-project-2"] };
// 기능 : 각 상태 검증에 독립 취소 신호를 제공한다.
const signal = () => new AbortController().signal;
beforeEach(() => vi.useFakeTimers()); afterEach(() => vi.useRealTimers());
describe("G17 local team boundaries", () => {
  it("commits exactly one Pending invitation for concurrent case-insensitive duplicate submissions", async () => {
    const { store, scope, runtime } = setup(); const revision = runtime.getSnapshot().revision;
    const results = await settle(Promise.allSettled([store.invite(scope, draft, signal()), store.invite(scope, { ...draft, email: "new@example.test" }, signal())]));
    expect("value" in results && results.value.filter(result => result.status === "fulfilled")).toHaveLength(1);
    const read = await settle(store.read(scope, signal())); expect("value" in read && read.value.filter(row => row.email === "new@example.test")).toEqual([expect.objectContaining({ status: "pending", joinedOn: null, role: "Collaborator", projectIds: draft.projectIds })]);
    expect(runtime.getSnapshot().revision).toBe(revision); expect(runtime.getSnapshot().session?.role).toBe("owner");
  });
  it("removes only the selected invitation while preserving its namesake, joined member and another workspace", async () => {
    const { store, scope, runtime } = setup(); store.setFixture(scope, "removing"); const result = await settle(store.read(scope, signal())); if (!("value" in result)) throw result.error; const target = result.value.find(row => row.email === "jon@example.test"); if (!target) throw new Error("fixture missing");
    const attempts = await settle(Promise.allSettled([store.remove(scope, target, signal()), store.remove(scope, target, signal())])); expect("value" in attempts && attempts.value.filter(value => value.status === "fulfilled")).toHaveLength(1);
    const next = await settle(store.read(scope, signal())); expect("value" in next && next.value.map(row => row.email)).toEqual(["owner@example.test", "jane@example.test", "jon2@example.test", "smith@example.test"]);
    runtime.setWorkspace("studio-a-two"); const other = { ...scope, workspaceId: "studio-a-two", revision: runtime.getSnapshot().revision }; store.setFixture(other, "removing");
    expect("error" in await settle(store.remove(other, target, signal()))).toBe(true); const otherRows = await settle(store.read(other, signal())); expect("value" in otherRows && otherRows.value).toHaveLength(5);
  });
  it("cancel, fixture replacement, workspace change and logout cannot commit late writes", async () => {
    const { store, scope, runtime } = setup(); store.setScenario("slow"); const cancelled = new AbortController(); const work = store.invite(scope, draft, cancelled.signal); cancelled.abort(); expect("error" in await settle(work)).toBe(true);
    const replaced = store.invite(scope, draft, signal()); store.setFixture(scope, "removing"); expect("error" in await settle(replaced)).toBe(true);
    const listing = await settle(store.read(scope, signal())); if (!("value" in listing) || !listing.value[1]) throw new Error("missing seed"); const removing = store.remove(scope, listing.value[1], signal()).then(() => ({ removed: true }), error => ({ error }));
    const moved = store.invite(scope, draft, signal()); runtime.setWorkspace("studio-a-two"); expect("error" in await settle(moved)).toBe(true); expect("error" in await removing).toBe(true);
    runtime.setWorkspace("studio-a"); const current = { ...scope, revision: runtime.getSnapshot().revision }; const loggedOut = store.invite(current, draft, signal()); runtime.setSession(null); expect("error" in await settle(loggedOut)).toBe(true);
    runtime.setSession("preview-a"); const rows = await settle(store.read({ ...scope, revision: runtime.getSnapshot().revision }, signal())); expect("value" in rows && rows.value.some(row => row.email === "new@example.test")).toBe(false);
  });
  it("fails once without changing rows, retries the same input, and preserves committed state across logout until Reset", async () => {
    const { store, scope, runtime } = setup(); store.setScenario("invite-error"); expect("error" in await settle(store.invite(scope, draft, signal()))).toBe(true);
    const created = await settle(store.invite(scope, draft, signal())); if (!("value" in created)) throw created.error;
    store.setScenario("remove-error"); expect("error" in await settle(store.remove(scope, created.value, signal()))).toBe(true);
    runtime.setSession(null); runtime.setSession("preview-a"); const next = { ...scope, revision: runtime.getSnapshot().revision }; const saved = await settle(store.read(next, signal())); expect("value" in saved && saved.value.some(row => row.id === created.value.id)).toBe(true);
    await settle(store.remove(next, created.value, signal())); const removed = await settle(store.read(next, signal())); expect("value" in removed && removed.value.some(row => row.id === created.value.id)).toBe(false);
    runtime.reset(); runtime.setSession("preview-a"); const reset = await settle(store.read({ ...scope, revision: runtime.getSnapshot().revision }, signal())); expect("value" in reset && reset.value).toHaveLength(2);
  });
  it("checks local role, existing member, expired duplicate, foreign project and target revision at the store boundary", async () => {
    const { store, scope, runtime } = setup();
    for (const input of [{ ...draft, email: "owner@example.test" }, { ...draft, projectIds: ["studio-b:team-project-2"] }, { ...draft, email: "bad" }]) expect("error" in await settle(store.invite(scope, input, signal()))).toBe(true);
    store.setScenario("expired"); expect("error" in await settle(store.invite(scope, { ...draft, email: "jane@example.test" }, signal()))).toBe(true);
    const rows = await settle(store.read(scope, signal())); if (!("value" in rows)) throw rows.error; const target = rows.value[1]; if (!target) throw new Error("fixture missing"); expect(target.status).toBe("expired");
    expect("error" in await settle(store.remove(scope, { ...target, revision: 99 }, signal()))).toBe(true);
    runtime.setSession("preview-b"); const member = { actorId: "preview-b" as const, workspaceId: "studio-b", revision: runtime.getSnapshot().revision }; expect("error" in await settle(store.invite(member, { ...draft, projectIds: [] }, signal()))).toBe(true);
  });
});

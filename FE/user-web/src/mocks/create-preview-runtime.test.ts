import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPreviewRuntime } from "./create-preview-runtime";
import { SEED_TIME } from "./preview-seed";
import type { PreviewRuntime } from "@/features/preview/data/preview-data-source";
import type { PreviewScope } from "@/features/preview/model/preview-types";
import { previewReturnPath } from "@/features/preview/model/preview-return-path";

// 기능 : 현재 목 문맥을 테스트 요청의 제출 시점 범위로 고정한다.
function scopeOf(runtime: PreviewRuntime): PreviewScope {
  const state = runtime.getSnapshot();
  if (!state.session || !state.workspaceId) throw new Error("Test session missing");
  return { actorId: state.session.id, workspaceId: state.workspaceId, revision: state.revision };
}
// 기능 : 가상 타이머를 진행하며 목 요청의 정상 결과를 기다린다.
async function resolvePreview<T>(promise: Promise<T>): Promise<T> {
  await vi.runAllTimersAsync();
  return promise;
}
// 기능 : 거부 처리기를 먼저 등록해 늦은 실패를 미처리 예외 없이 검증한다.
async function rejectPreview(promise: Promise<unknown>, expected: object) {
  const assertion = expect(promise).rejects.toMatchObject(expected);
  await vi.runAllTimersAsync();
  await assertion;
}
// 기능 : 각 검증 요청에 독립된 취소 신호를 만든다.
const signal = () => new AbortController().signal;

describe("local preview lifetime", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => { vi.clearAllTimers(); vi.useRealTimers(); });

  it("shares one ID between list/detail without exposing mutable seed and resets deterministically", async () => {
    const runtime = createPreviewRuntime();
    expect(runtime.getSnapshot().session).toBeNull();
    runtime.setSession("preview-a");
    const scope = scopeOf(runtime);
    const list = await resolvePreview(runtime.source.list(scope, signal()));
    expect(list[0]).toMatchObject({ id: "sample-001", name: "Design Resources", updatedAt: SEED_TIME });
    if (list[0]) list[0].name = "mutated copy";
    expect((await resolvePreview(runtime.source.detail(scope, "sample-001", signal()))).name).toBe("Design Resources");
    await resolvePreview(runtime.source.rename(scope, "sample-001", "Renamed", signal()));
    expect((await resolvePreview(runtime.source.list(scope, signal())))[0]).toMatchObject({ name: "Renamed", updatedAt: "2024-02-06T09:00:01.000Z" });
    runtime.reset();
    expect(runtime.getSnapshot()).toMatchObject({ session: null, scenario: "normal" });
    runtime.setSession("preview-a");
    expect((await resolvePreview(runtime.source.detail(scopeOf(runtime), "sample-001", signal()))).updatedAt).toBe(SEED_TIME);
  });

  it("rejects stale writes after logout and the same actor logs in again", async () => {
    const runtime = createPreviewRuntime();
    runtime.setSession("preview-a");
    runtime.setScenario("slow");
    const write = runtime.source.rename(scopeOf(runtime), "sample-001", "Stale", signal());
    runtime.setSession(null); runtime.setSession("preview-a");
    await rejectPreview(write, { name: "AbortError" });
    expect((await resolvePreview(runtime.source.detail(scopeOf(runtime), "sample-001", signal()))).name).toBe("Design Resources");
  });

  it("isolates actors and workspaces even with the same item ID", async () => {
    const runtime = createPreviewRuntime();
    runtime.setSession("preview-a");
    const write = runtime.source.rename(scopeOf(runtime), "sample-001", "Wrong workspace", signal());
    runtime.setWorkspace("studio-a-two");
    await rejectPreview(write, { name: "AbortError" });
    expect((await resolvePreview(runtime.source.detail(scopeOf(runtime), "sample-001", signal()))).name).toBe("Second studio sample");
    runtime.setSession("preview-b");
    expect((await resolvePreview(runtime.source.detail(scopeOf(runtime), "sample-001", signal()))).name).toBe("Member sample");
    expect(() => runtime.setWorkspace("studio-a")).toThrow("Workspace unavailable");
  });

  it("cancels reads and writes without changing data or retaining timers", async () => {
    const runtime = createPreviewRuntime();
    runtime.setSession("preview-a");
    const controller = new AbortController();
    const write = runtime.source.rename(scopeOf(runtime), "sample-001", "Cancelled", controller.signal);
    controller.abort();
    await rejectPreview(write, { name: "AbortError" });
    expect(vi.getTimerCount()).toBe(0);
    await rejectPreview(runtime.source.list(scopeOf(runtime), controller.signal), { name: "AbortError" });
    expect((await resolvePreview(runtime.source.list(scopeOf(runtime), signal())))[0]?.name).toBe("Design Resources");
  });

  it("fails once then retries the same input with no partial write", async () => {
    const runtime = createPreviewRuntime();
    runtime.setSession("preview-a"); runtime.setScenario("write-error");
    const scope = scopeOf(runtime);
    await rejectPreview(runtime.source.rename(scope, "sample-001", "Retry name", signal()), { kind: "write" });
    expect((await resolvePreview(runtime.source.detail(scope, "sample-001", signal()))).name).toBe("Design Resources");
    expect(await resolvePreview(runtime.source.rename(scope, "sample-001", "Retry name", signal()))).toMatchObject({ name: "Retry name", updatedAt: "2024-02-06T09:00:01.000Z" });
  });

  it("distinguishes empty, missing, denied and transient reads", async () => {
    const runtime = createPreviewRuntime();
    runtime.setSession("preview-a"); runtime.setScenario("empty");
    expect(await resolvePreview(runtime.source.list(scopeOf(runtime), signal()))).toEqual([]);
    await rejectPreview(runtime.source.detail(scopeOf(runtime), "sample-001", signal()), { kind: "missing" });
    runtime.setScenario("denied");
    await rejectPreview(runtime.source.list(scopeOf(runtime), signal()), { kind: "denied" });
    runtime.setScenario("read-error");
    await rejectPreview(runtime.source.list(scopeOf(runtime), signal()), { kind: "read" });
    expect(await resolvePreview(runtime.source.list(scopeOf(runtime), signal()))).toHaveLength(1);
  });

  it("reset prevents an outstanding write from reviving data and clears failure scenarios", async () => {
    const runtime = createPreviewRuntime();
    runtime.setSession("preview-a"); runtime.setScenario("slow");
    const write = runtime.source.rename(scopeOf(runtime), "sample-001", "Before reset", signal());
    runtime.reset(); runtime.setSession("preview-a");
    await rejectPreview(write, { name: "AbortError" });
    expect((await resolvePreview(runtime.source.list(scopeOf(runtime), signal())))[0]?.name).toBe("Design Resources");
  });

  it("shares only the public seed, without authentication or internal mutations", async () => {
    const runtime = createPreviewRuntime();
    expect(await resolvePreview(runtime.source.shared("sample", signal()))).toMatchObject({ id: "shared-sample", name: "Shared preview" });
    runtime.setSession("preview-a");
    await resolvePreview(runtime.source.rename(scopeOf(runtime), "sample-001", "Private name", signal()));
    expect((await resolvePreview(runtime.source.shared("sample", signal()))).name).toBe("Shared preview");
    await rejectPreview(runtime.source.shared("sample-001", signal()), { kind: "missing" });
  });

  it("allows only internal return paths and rejects blank names before writing", async () => {
    expect(previewReturnPath("https://example.invalid")).toBe("/app");
    expect(previewReturnPath("//example.invalid/app")).toBe("/app");
    expect(previewReturnPath("/app/items/sample-001")).toBe("/app/items/sample-001");
    const runtime = createPreviewRuntime(); runtime.setSession("preview-a");
    await rejectPreview(runtime.source.rename(scopeOf(runtime), "sample-001", "  ", signal()), { kind: "invalid" });
    expect(vi.getTimerCount()).toBe(0);
  });
});

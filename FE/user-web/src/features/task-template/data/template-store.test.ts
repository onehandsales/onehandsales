import { expect, it } from "vitest";
import { createPreviewRuntime } from "@/mocks/create-preview-runtime";
import { createTemplateStore } from "./create-template-store";
import { emptyTemplateTask } from "../model/template-values";
// 기능 : 목 인증과 템플릿 저장소를 실제 앱과 같은 수명으로 준비한다.
function setup() { const runtime = createPreviewRuntime(); const store = createTemplateStore(runtime); store.connect(); runtime.setSession("preview-a"); return { runtime, store }; }
// 기능 : 현재 가상 실행 문맥을 저장 시작 시점에 고정한다.
function scope(runtime: ReturnType<typeof createPreviewRuntime>) { const state = runtime.getSnapshot(); return { actorId: state.session!.id, workspaceId: state.workspaceId!, revision: state.revision }; }
// 기능 : 각 요청의 독립적인 취소 신호를 제공한다.
function signal() { return new AbortController().signal; }
const draft = { ...emptyTemplateTask(), title: "Update company guideline" };

// 기능 : 빈 템플릿·동명 ID·동일 제출·실패 재시도를 실제 저장 결과로 검증한다.
it("G30 creates empty named templates once per intent, permits separate same-name templates and preserves failures", async () => {
  const { runtime, store } = setup(); const s = scope(runtime);
  expect(await store.read(s, signal())).toEqual([]); await expect(store.create(s, " ", "blank", signal())).rejects.toThrow("name");
  store.setScenario("write-error"); await expect(store.create(s, " Default Task ", "first", signal())).rejects.toThrow("preserved");
  const [a, duplicate] = await Promise.all([store.create(s, "Default Task", "first", signal()), store.create(s, "Default Task", "first", signal())]); expect(a.id).toBe(duplicate.id); expect(a.tasks).toEqual([]);
  const b = await store.create(s, "Default Task", "second", signal()); expect(b.id).not.toBe(a.id); expect(await store.read(s, signal())).toHaveLength(2);
  const renamed = await store.rename(s, a.id, 0, "Updated", signal()); expect(renamed.name).toBe("Updated"); expect(store.current(s, b.id)?.name).toBe("Default Task");
  await expect(store.rename(s, a.id, 0, "Stale", signal())).rejects.toThrow("changed");
});
// 기능 : 하위·첨부 초안은 상위 저장 때만 확정하고 조회 원본 및 다른 항목과 분리한다.
it("G30 commits whole task snapshots only at Save Task and never lets draft or query mutations alter saved data", async () => {
  const { runtime, store } = setup(); const s = scope(runtime); const template = await store.create(s, "Template", "one", signal());
  const file = new Blob(["local image bytes"], { type: "image/png" }); const input = { ...draft, files: [{ id: "file", name: "local.png", file }], subtasks: [{ id: "child", title: "Send invite", completed: false }] };
  expect(store.current(s, template.id)?.tasks).toEqual([]);
  const a = await store.saveTask(s, template.id, null, 0, input, "task", signal()); const duplicate = await store.saveTask(s, template.id, null, 0, input, "task", signal()); expect(a.id).toBe(duplicate.id);
  input.subtasks[0]!.title = "Unsaved"; input.files[0]!.name = "Changed"; a.subtasks[0]!.completed = true;
  const saved = store.current(s, template.id)!.tasks[0]!; expect(saved.subtasks[0]).toMatchObject({ title: "Send invite", completed: false }); expect(saved.files[0]).toMatchObject({ name: "local.png" }); expect(saved.files[0]!.file.size).toBe(file.size);
  const other = await store.saveTask(s, template.id, null, 0, draft, "other", signal()); await store.saveTask(s, template.id, saved.id, 0, { ...saved, description: "Updated independently" }, "edit", signal());
  await expect(store.saveTask(s, template.id, saved.id, 0, draft, "stale", signal())).rejects.toThrow("changed"); expect(store.current(s, template.id)?.tasks.find(task => task.id === other.id)?.description).toBe("");
});
// 기능 : 삭제 후 늦은 수정·생성 재실행이 사라진 구성 작업을 부활시키지 않게 검증한다.
it("G30 deletes only a template task and rejects stale edits and replayed creations", async () => {
  const { runtime, store } = setup(); const s = scope(runtime); const template = await store.create(s, "Template", "one", signal()); const task = await store.saveTask(s, template.id, null, 0, draft, "task", signal());
  const [removed, edit] = await Promise.allSettled([store.deleteTask(s, template.id, task.id, task.revision, signal()), store.saveTask(s, template.id, task.id, task.revision, draft, "late", signal())]); expect(removed.status).toBe("fulfilled"); expect(edit.status).toBe("rejected");
  expect(store.current(s, template.id)?.tasks).toEqual([]); await expect(store.saveTask(s, template.id, null, 0, draft, "task", signal())).rejects.toThrow("unavailable");
});
// 기능 : 실패·취소·workspace 전환·로그아웃·권한·Reset의 저장 수명을 검증한다.
it("G30 preserves saved definitions while aborting pending edits and isolates workspace, owner permissions and reset", async () => {
  const { runtime, store } = setup(); const s = scope(runtime); const template = await store.create(s, "Template", "one", signal());
  store.setScenario("write-error"); await expect(store.saveTask(s, template.id, null, 0, draft, "retry", signal())).rejects.toThrow("preserved"); const saved = await store.saveTask(s, template.id, null, 0, draft, "retry", signal());
  store.setScenario("slow"); const controller = new AbortController(); const cancelled = store.deleteTask(s, template.id, saved.id, 0, controller.signal); controller.abort(); await expect(cancelled).rejects.toMatchObject({ name: "AbortError" });
  const pending = store.rename(s, template.id, 1, "Wrong workspace", signal()); runtime.setWorkspace("studio-a-two"); await expect(pending).rejects.toMatchObject({ name: "AbortError" }); expect(await store.read(scope(runtime), signal())).toEqual([]);
  runtime.setSession(null); runtime.setSession("preview-a"); expect(store.current(scope(runtime), template.id)?.tasks).toHaveLength(1);
  const owner = runtime.getSnapshot().session!; runtime.openSession({ ...owner, role: "member", memberships: { "studio-a": { role: "member" } } }); const member = scope(runtime);
  expect(store.current(member, template.id)?.tasks).toHaveLength(1); await expect(store.rename(member, template.id, 1, "Forbidden", signal())).rejects.toThrow("owner");
  runtime.reset(); runtime.setSession("preview-a"); expect(await store.read(scope(runtime), signal())).toEqual([]); store.setScenario("read-error"); await expect(store.read(scope(runtime), signal())).rejects.toThrow("Unable"); expect(await store.read(scope(runtime), signal())).toEqual([]);
  store.setScenario("denied"); await expect(store.read(scope(runtime), signal())).rejects.toMatchObject({ kind: "denied" });
});

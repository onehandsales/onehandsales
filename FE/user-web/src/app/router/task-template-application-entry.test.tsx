import { act } from "react";
import { describe, expect, it } from "vitest";
import { router } from "@/app/router/router";
import { setupPreviewApp } from "@/test/preview-app";

const { element, navigate, click, choose, input, settle, waitFor } = setupPreviewApp("/app/tasks?tab=Templates");
const templateSelect = '[aria-label="Template Name"]';
const projectSelect = '[aria-label="Template project"]';
const projectId = "studio-a:team-project-2";
const applyButton = ".template-apply-footer [type=submit]";
const generated = '[data-task-id*="task-from-template-"]';
// 기능 : 실제 작성 화면으로 저장한 템플릿 ID를 적용 검사에 넘긴다.
async function source(empty = false, readError = false) {
  await click(".task-templates-intro .task-primary"); await input(".template-name-dialog input", "Default Task");
  await click(".template-name-dialog [type=submit]");
  await waitFor(() => expect(document.querySelector(".template-heading")).not.toBeNull());
  const id = new URLSearchParams(location.search).get("template")!;
  if (!empty) {
    await click(".template-heading>.task-primary"); await input('.template-editor-fields input[name="title"]', "Update company guideline");
    await input('[aria-label="New template subtask"]', "Prepare proposal"); await click(".template-subtask-form button");
    await click(".template-editor-footer [type=submit]");
    await waitFor(() => expect(document.querySelectorAll("[data-template-task-id]")).toHaveLength(1));
  }
  if (readError) await choose('[aria-label="Template scenario"]', "read-error");
  await navigate("/app/tasks"); await settle(); return id;
}
// 기능 : 전체 보드에서 동일 템플릿과 프로젝트 ID를 고른다.
async function selectSource(id: string) {
  await click('[aria-label="Create tasks from template"]'); await waitFor(() => expect(document.querySelector(templateSelect)).not.toBeNull(), 5000);
  await choose(templateSelect, id); await choose(projectSelect, projectId);
}
// 기능 : 실제 앱에서 적용의 주소·실패·취소·반복 의도와 권한 경계를 검증한다.
describe("G31 template application entries", () => {
  it("preserves external URL and history state on entry and direct close", async () => {
    await source();
    const path = "/app/tasks?source=client#board";
    await act(async () => router.navigate(path, { state: { retained: true } })); await settle();
    await act(async () => element('[aria-label="Create tasks from template"]').focus());
    await click('[aria-label="Create tasks from template"]'); await settle();
    expect.soft(router.state.location.state).toEqual({ retained: true, templateApplyEntry: true });
    expect.soft(location.hash).toBe("#board");
    await click(".template-apply-dialog .dialog__close"); await settle();
    expect.soft(router.state.location.state).toEqual({ retained: true });
    expect.soft(document.activeElement === document.querySelector('[aria-label="Create tasks from template"]')).toBe(true);
    await act(async () => router.navigate("/app/tasks?source=client&applyTemplate=new#board", { state: { retained: true } })); await settle();
    await click(".template-apply-dialog .dialog__close"); await settle();
    expect.soft(router.state.location.state).toEqual({ retained: true });
    expect(location.pathname + location.search + location.hash).toBe(path);
  });
  it("focuses failed and cancelled applications, retries once and allows a deliberate repeat", async () => {
    const id = await source(); await choose('[aria-label="Task scenario"]', "write-error"); await selectSource(id);
    await act(async () => element(applyButton).focus()); await click(applyButton);
    await waitFor(() => expect(element('.template-apply-fields [role="alert"]').textContent).toContain("preserved"));
    const alert = element('.template-apply-fields [role="alert"]');
    expect.soft(document.activeElement === alert).toBe(true);
    expect.soft(element(applyButton).getAttribute("aria-describedby")).toBe(alert.id || "missing-error-id");
    expect(element<HTMLSelectElement>(templateSelect).value).toBe(id); expect(element<HTMLSelectElement>(projectSelect).value).toBe(projectId);
    expect(document.querySelectorAll(generated)).toHaveLength(0);
    await act(async () => { element(applyButton).click(); element(applyButton).click(); });
    await waitFor(() => expect(document.querySelectorAll(generated)).toHaveLength(1));
    const firstId = element(generated).dataset.taskId;
    expect(element(generated).textContent).toContain("No due date");
    expect(element('[data-task-id="studio-a:task-initial-chat-1"]').closest("section")?.textContent).toContain("In Progress");
    await choose('[aria-label="Task scenario"]', "slow"); await selectSource(id); await click(applyButton);
    await act(async () => element(".template-apply-cancel").focus()); await click(".template-apply-cancel"); await settle(60);
    expect.soft(document.activeElement === document.querySelector(templateSelect)).toBe(true);
    await settle(1600); expect(document.querySelectorAll(generated)).toHaveLength(1);
    await choose('[aria-label="Task scenario"]', "normal"); await click(applyButton);
    await waitFor(() => expect(document.querySelectorAll(generated)).toHaveLength(2));
    const ids = Array.from(document.querySelectorAll<HTMLElement>(generated), row => row.dataset.taskId);
    expect(ids).toContain(firstId); expect(new Set(ids).size).toBe(2);
  }, 15000);
  it("discards pending applications on a new entry, back navigation and denied access", async () => {
    const id = await source(); await choose('[aria-label="Task scenario"]', "slow"); await selectSource(id); await click(applyButton);
    await navigate(location.pathname + location.search + "&entry=again"); await settle(1700);
    expect(element<HTMLSelectElement>(templateSelect).value).toBe(""); expect(document.querySelectorAll(generated)).toHaveLength(0);
    await choose(templateSelect, id); await choose(projectSelect, projectId); await click(applyButton);
    await act(async () => router.navigate(-1)); await settle(1700);
    expect(document.querySelectorAll(generated)).toHaveLength(0);
    await navigate("/app/tasks"); await settle(1600); await selectSource(id); await click(applyButton);
    await choose('[aria-label="Task scenario"]', "denied"); await settle(1700);
    expect(document.querySelectorAll(generated)).toHaveLength(0);
    expect(element(".template-apply-state").textContent).toContain("unavailable in this local access scenario");
    await choose('[aria-label="Task scenario"]', "normal"); await settle();
    expect(document.querySelectorAll(generated)).toHaveLength(0);
  }, 20000);
  it("does not submit an empty template or a project outside the workspace", async () => {
    const id = await source(true); await selectSource(id);
    expect(element<HTMLButtonElement>(applyButton).disabled).toBe(true);
    expect(element('.template-apply-note').textContent).toContain("no tasks");
    await navigate("/app/tasks?applyTemplate=new&templateProject=studio-b%3Ateam-project-2"); await settle();
    expect(element<HTMLButtonElement>(applyButton).disabled).toBe(true);
    expect(element('.template-apply-fields [role="alert"]').textContent).toContain("outside your assigned scope");
    expect(document.querySelectorAll(generated)).toHaveLength(0);
  });
  it("retries unreadable choices and keeps the project entry and keyboard tooltip", async () => {
    const id = await source(false, true);
    await navigate(`/app/projects/${encodeURIComponent(projectId)}?tab=Tasks`); await settle();
    const trigger = '[aria-label="Create tasks from template"]';
    await act(async () => element(trigger).focus()); expect(element('[role="tooltip"]').textContent).toBe("Add from a task template");
    await act(async () => element(trigger).dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })));
    expect(document.querySelector('[role="tooltip"]')).toBeNull();
    await click(trigger); await settle();
    expect(element('.template-apply-state [role="alert"], .template-apply-state[role="alert"]').textContent).toContain("Unable to load");
    await act(async () => element(".template-apply-state button").focus());
    await click(".template-apply-state button"); await waitFor(() => expect(document.querySelector(projectSelect)).not.toBeNull());
    expect.soft(document.activeElement === document.querySelector(templateSelect)).toBe(true);
    expect(element<HTMLSelectElement>(projectSelect).value).toBe(projectId); await choose(templateSelect, id);
    await click(applyButton); await waitFor(() => expect(document.querySelectorAll(generated)).toHaveLength(1));
    expect(new URLSearchParams(location.search).get("tab")).toBe("Tasks");
  });
});

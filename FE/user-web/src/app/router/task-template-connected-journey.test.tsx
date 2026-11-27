import { act } from "react";
import { describe, expect, it, vi } from "vitest";
import { setupPreviewApp } from "@/test/preview-app";

const { element, navigate, click, choose, input, settle, waitFor } = setupPreviewApp("/app/tasks?tab=Templates");
const projectId = "studio-a:team-project-2";
const projectPath = `/app/projects/${encodeURIComponent(projectId)}`;
const title = '[aria-label="Task title"]';
const generated = '[data-task-id*="task-from-template-"]';
// 기능 : 설명과 댓글 textarea에 실제 제어 입력 이벤트를 전달한다.
async function textArea(selector: string, value: string) {
  await act(async () => { const field = element<HTMLTextAreaElement>(selector); Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!.set!.call(field, value); field.dispatchEvent(new Event("input", { bubbles: true })); });
}
// 기능 : 실제 필드에서 Enter로 기존 목 저장 경계를 확정한다.
async function enter(selector: string) { await act(async () => element(selector).dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }))); await settle(); }
// 기능 : 현재 프로젝트 보드의 생성 작업 ID를 화면에서 수집한다.
function ids() { return Array.from(document.querySelectorAll<HTMLElement>(generated), row => row.dataset.taskId!); }
// 기능 : 매번 새 적용 창에서 선택한 템플릿을 동일 프로젝트에 적용한다.
async function apply(templateId: string, count: number) {
  await click('[aria-label="Create tasks from template"]');
  await waitFor(() => expect(document.querySelector('[aria-label="Template Name"]')).not.toBeNull());
  expect(element<HTMLSelectElement>('[aria-label="Template project"]').value).toBe(projectId);
  await choose('[aria-label="Template Name"]', templateId); await click('.template-apply-footer [type="submit"]');
  await waitFor(() => expect(document.querySelectorAll(generated)).toHaveLength(count));
  await waitFor(() => expect(document.querySelector(".template-apply-dialog")).toBeNull());
}
// 기능 : 템플릿 작성부터 실제 작업 수명 종료까지 하나의 앱·저장소로 연결한다.
describe("G30-G31 final connected review", () => {
  it("keeps source and other copies independent through edits, children, activity, completion, archive and delete", async () => {
    await navigate(`${projectPath}?tab=Time+Tracking`); await settle();
    const historicalTime = element(".project-time-layout").textContent;
    const historicalLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>(".project-time-task"), row => row.getAttribute("href"));
    const clientHref = element(".project-context-row>a").getAttribute("href");
    expect(historicalTime).toContain("$20.04");
    await navigate("/app/tasks?tab=Templates"); await settle();
    await click(".task-templates-intro .task-primary"); await input(".template-name-dialog input", "Cleaning checklist"); await click('.template-name-dialog [type="submit"]');
    await waitFor(() => expect(document.querySelector(".template-heading")).not.toBeNull());
    const templateId = new URLSearchParams(location.search).get("template")!;
    await click(".template-heading>.task-primary"); await input('input[name="title"]', "Cleaning visit"); await textArea('[aria-label="Description"]', "Prepare the customer visit");
    vi.stubGlobal("createImageBitmap", vi.fn().mockResolvedValue({ close: vi.fn() }));
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:connected-template"); vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    await act(async () => { const field = element<HTMLInputElement>('[aria-label="Template task file"]'); Object.defineProperty(field, "files", { configurable: true, value: [new File(["local image bytes"], "visit.png", { type: "image/png" })] }); field.dispatchEvent(new Event("change", { bubbles: true })); });
    for (const child of ["Prepare supplies", "Clean rooms"]) {
      if (!document.querySelector('[aria-label="New template subtask"]')) await click(".template-subtasks>.template-text-button");
      await input('[aria-label="New template subtask"]', child); await click(".template-subtask-form button");
    }
    await click('.template-subtask input');
    await click('.template-editor-footer [type="submit"]'); await waitFor(() => expect(document.querySelectorAll("[data-template-task-id]")).toHaveLength(1));
    const sourceTaskId = element("[data-template-task-id]").dataset.templateTaskId!;
    await click(".template-heading>.task-primary"); await input('input[name="title"]', "Schedule follow up"); await click('.template-editor-footer [type="submit"]');
    await waitFor(() => expect(document.querySelectorAll("[data-template-task-id]")).toHaveLength(2));
    await navigate(`${projectPath}?tab=Tasks`); await settle(); await apply(templateId, 2); const first = ids();
    await apply(templateId, 4); const second = ids().filter(id => !first.includes(id));
    expect(new Set([...first, ...second]).size).toBe(4); expect(ids()).not.toContain(sourceTaskId);
    await click('.task-batch-feedback [aria-label="View project tasks"]'); await settle(); expect(ids()).toHaveLength(4);
    await click(`[data-task-id="${first[0]}"] a`); await settle();
    expect(new URLSearchParams(location.search).get("task")).toBe(first[0]);
    expect(element<HTMLTextAreaElement>('[aria-label="Task description"]').value).toBe("Prepare the customer visit");
    expect(element('[aria-label="Preview visit.png"]')).toBeDefined();
    expect(element('[aria-label="Recorded task time"]').textContent).toContain("No hours added");
    expect(element('[aria-label="Task status"]').textContent).toContain("To Do");
    expect(element<HTMLInputElement>('.subtask-row input[type="checkbox"]').checked).toBe(false);
    const childId = element(".subtask-item").dataset.subtaskId;
    await input(title, "Changed visit"); await enter(title);
    await input(".subtask-title", "Changed supplies"); await enter(".subtask-title");
    await click('[aria-label="Task assignee"]'); await click('.task-properties .task-assignee-menu [role="option"]'); await settle();
    await click('[aria-label="Assignee for Changed supplies"]'); await click('.subtask-row .task-assignee-menu [role="option"]'); await settle();
    await click('.subtask-row input[type="checkbox"]'); await settle();
    expect(element('[aria-label="Task status"]').textContent).toContain("To Do");
    await textArea('[aria-label="Comment body"]', "Customer confirmed the visit"); await click('.task-comment-form button[type="submit"]');
    await waitFor(() => expect(element('[data-activity-kind="comment"] p').textContent).toBe("Customer confirmed the visit"));
    const commentId = element('[data-activity-kind="comment"]').dataset.activityId;
    await click('[aria-label="Task status"]'); await click('.task-status-menu [role="option"]:last-of-type'); await settle();
    expect(element<HTMLInputElement>('.subtask-item:nth-of-type(2) input[type="checkbox"]').checked).toBe(false);
    await navigate(`/app/tasks?task=${first[0]}`); await settle();
    expect(element<HTMLInputElement>(title).value).toBe("Changed visit"); expect(element(".subtask-item").dataset.subtaskId).toBe(childId);
    expect(element('[data-activity-kind="comment"]').dataset.activityId).toBe(commentId); expect(element('[aria-label="Task status"]').textContent).toContain("Done");
    expect(element(".subtask-row .task-avatar").textContent).toBe("A");
    await navigate(`${projectPath}?tab=Time+Tracking&task=${first[0]}`); await settle();
    expect(element<HTMLInputElement>(title).value).toBe("Changed visit"); expect(element(".project-time-layout").textContent).toBe(historicalTime);
    await navigate(`/app/tasks?tab=Templates&template=${templateId}`); await settle();
    const sourceRow = `[data-template-task-id="${sourceTaskId}"]`;
    await click(`${sourceRow} summary`); expect(element(sourceRow).textContent).toContain("Cleaning visit");
    expect(element(sourceRow).textContent).toContain("Prepare supplies"); expect(element(`${sourceRow} [aria-label="Preview visit.png"]`)).toBeDefined();
    await click(`${sourceRow} .template-task-detail>button`); await input('input[name="title"]', "Next version"); await click('[aria-label="Remove visit.png"]');
    await click('.template-editor-footer [type="submit"]'); await waitFor(() => expect(element(`${sourceRow} summary`).textContent).toBe("Next version"));
    await navigate(`${projectPath}?tab=Tasks&task=${first[0]}`); await settle();
    expect(element('[aria-label="Preview visit.png"]')).toBeDefined();
    await click('.task-panel-title .task-actions>button'); await click('.task-panel-title [role="menuitem"]:nth-child(3)');
    await waitFor(() => expect(document.querySelector(".task-dialog")).toBeNull()); expect(ids()).not.toContain(first[0]);
    await click(`[data-task-id="${first[1]}"] a`); await settle();
    await click('.task-panel-title .task-actions>button'); await click('.task-panel-title [role="menuitem"]:nth-child(4)'); await click(".task-delete-confirm");
    await waitFor(() => expect(document.querySelector(".task-dialog")).toBeNull()); expect(ids()).toEqual(second);
    await click(`[data-task-id="${second[0]}"] a`); await settle();
    expect(element<HTMLInputElement>(title).value).toBe("Cleaning visit"); expect(element('[aria-label="Preview visit.png"]')).toBeDefined();
    expect(element<HTMLTextAreaElement>('[aria-label="Task description"]').value).toBe("Prepare the customer visit");
    expect(element<HTMLInputElement>(".subtask-title").value).toBe("Prepare supplies"); expect(element<HTMLInputElement>('.subtask-row input[type="checkbox"]').checked).toBe(false);
    expect(element(".subtask-item").dataset.subtaskId).not.toBe(childId);
    expect(document.querySelector('[data-activity-kind="comment"]')).toBeNull(); expect(element('[aria-label="Task status"]').textContent).toContain("To Do");
    expect(element('[aria-label="Task assignee"]').textContent).toBe("Unassigned");
    await navigate(`/app/tasks?tab=Templates&template=${templateId}`); await settle();
    expect(document.querySelectorAll("[data-template-task-id]")).toHaveLength(2); expect(element(`${sourceRow} summary`).textContent).toBe("Next version");
    await click(`${sourceRow} summary`); expect(document.querySelector(`${sourceRow} .template-file-card`)).toBeNull();
    expect(element(sourceRow).textContent).toContain("Prepare supplies");
    await navigate(`${projectPath}?tab=Time+Tracking`); await settle();
    expect(element(".project-time-layout").textContent).toBe(historicalTime);
    expect(Array.from(document.querySelectorAll<HTMLAnchorElement>(".project-time-task"), row => row.getAttribute("href"))).toEqual(historicalLinks);
    expect(element(".project-context-row>a").getAttribute("href")).toBe(clientHref);
    await navigate("/app/tasks"); await settle(); expect(ids()).toEqual(second);
    expect(element('[data-task-id="studio-a:task-initial-chat-1"]')).toBeDefined(); expect(element('[data-task-id="studio-a:task-initial-chat-2"]')).toBeDefined();
  }, 45000);
});

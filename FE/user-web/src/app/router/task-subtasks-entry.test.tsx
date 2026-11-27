import { act } from "react";
import { describe, expect, it } from "vitest";
import { setupPreviewApp } from "@/test/preview-app";

const task = "studio-a:task-initial-chat-1";
const { element, navigate, click, choose, input, settle, waitFor } = setupPreviewApp(`/app/tasks?task=${task}`);
// 기능 : 실제 패널에서 같은 부모와 하위 ID의 저장·완료·배정 경계를 검증한다.
describe("G26 subtask entries", () => {
  // 기능 : 담당자 검색에서 위 방향키를 처음 누르면 마지막 선택지부터 탐색한다.
  it("starts upward assignee navigation at the last option and restores its trigger", async () => {
    await add('Keyboard child');
    for (const label of ['Task assignee', 'Assignee for Keyboard child']) {
      const trigger = `[aria-label="${label}"]`;
      await click(trigger);
      const options = [...document.querySelectorAll<HTMLButtonElement>('.task-assignee-menu [role="option"]')];
      expect(options.length).toBeGreaterThan(label === 'Task assignee' ? 1 : 0);
      await act(async () => element(`input[aria-label="Search ${label.toLowerCase()}"]`).dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true })));
      expect(document.activeElement === options.at(-1)).toBe(true);
      await act(async () => document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true, cancelable: true })));
      expect(document.activeElement === options[0]).toBe(true);
      await act(async () => document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true })));
      expect(document.activeElement === options.at(-1)).toBe(true);
      await act(async () => document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true })));
      expect(document.activeElement === options[0]).toBe(true);
      await act(async () => document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })));
      await settle(50); expect(document.activeElement === element(trigger)).toBe(true);
    }
  });
  // 기능 : 새 하위 입력을 저장하고 조회 갱신으로 추가된 행을 기다린다.
  async function add(name: string) {
    await click(".task-subtasks > .task-add"); await input('[aria-label="New subtask title"]', name);
    await click('.subtask-input-row button');
    await waitFor(() => { expect(element<HTMLInputElement>(`[aria-label="Subtask title ${name}"]`).value).toBe(name); });
  }
  // 기능 : 제목 변경 직후 완료를 눌러도 두 의도가 하나의 하위 항목에 반영된다.
  it("keeps the title and completion intent together before assigning a completed child", async () => {
    const status = element('[aria-label="Task status"]').textContent;
    await add("Send invite"); await add("Prepare a deck");
    const id = element('.subtask-item').dataset.subtaskId;
    await act(async () => element('.subtask-title').focus()); await input('.subtask-title', "Send revised invite");
    await act(async () => { const checkbox = element<HTMLInputElement>('.subtask-row input[type="checkbox"]'); checkbox.focus(); checkbox.click(); });
    await waitFor(() => { expect(element<HTMLInputElement>('.subtask-title').value).toBe("Send revised invite"); expect(element<HTMLInputElement>('.subtask-row input[type="checkbox"]').checked).toBe(true); });
    await click('[aria-label="Assignee for Send revised invite"]'); await click('.subtask-row .task-assignee-menu [role="option"]'); await settle();
    expect(element('.subtask-item').dataset.subtaskId).toBe(id);
    expect(element('.subtask-item .task-avatar').textContent).toBe("A");
    expect(element<HTMLInputElement>('.subtask-item:nth-of-type(2) input[type="checkbox"]').checked).toBe(false);
    expect(element('[aria-label="Task status"]').textContent).toBe(status);
    await navigate(`/app/projects/studio-a%3Ateam-project-2?tab=Time+Tracking&task=${task}`); await settle();
    expect(element('.project-time-layout').textContent).toContain("$20.04");
    expect(element('.subtask-item').dataset.subtaskId).toBe(id);
  });
  // 기능 : 하위 조합 입력을 취소해도 부모 편집기가 조합 중으로 고정되지 않는다.
  it("isolates child composition and restores focus after cancellation", async () => {
    await click(".task-subtasks > .task-add");
    await act(async () => element('[aria-label="New subtask title"]').dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true })));
    await input('[aria-label="New subtask title"]', "취소"); await click(".subtask-cancel"); await settle(40);
    expect.soft(document.activeElement === element(".task-subtasks > .task-add")).toBe(true);
    await input('[aria-label="Task title"]', "Parent remains editable");
    await act(async () => element('[aria-label="Task title"]').dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true })));
    await settle(); await navigate(`/app/tasks?task=${task}&entry=next`); await settle();
    expect(element<HTMLInputElement>('[aria-label="Task title"]').value).toBe("Parent remains editable");
    expect(document.querySelector('.subtask-item')).toBeNull();
  });
  // 기능 : 하위 실패 재시도·빈 제목 오류·미저장 취소가 부모나 기존 행을 바꾸지 않는다.
  it("retains failed creation and supports accessible correction and retry", async () => {
    await click('.task-subtasks > .task-add'); await click('.subtask-input-row button');
    await waitFor(() => { expect(element('[aria-label="New subtask title"]').getAttribute("aria-invalid")).toBe("true"); });
    expect(document.activeElement === element('[aria-label="New subtask title"]')).toBe(true);
    await input('[aria-label="New subtask title"]', "Retry child");
    await choose('[aria-label="Task scenario"]', "write-error"); await settle();
    await click('.subtask-input-row button'); await waitFor(() => { expect(element('.subtask-error').textContent).toContain("preserved"); });
    expect(element<HTMLInputElement>('[aria-label="New subtask title"]').value).toBe("Retry child");
    await act(async () => { const save = element('.subtask-input-row button'); save.click(); save.click(); });
    await waitFor(() => { expect(document.querySelectorAll('.subtask-item')).toHaveLength(1); });
    await settle(); expect(document.activeElement === element('.task-subtasks > .task-add')).toBe(true);
    await act(async () => element('.subtask-title').focus()); await input('.subtask-title', "Discarded title");
    await act(async () => element('.subtask-title').dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true })));
    expect(element<HTMLInputElement>('.subtask-title').value).toBe("Retry child");
  });
});

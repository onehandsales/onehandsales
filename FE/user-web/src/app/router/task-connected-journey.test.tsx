import { act } from "react";
import { describe, expect, it } from "vitest";
import { setupPreviewApp } from "@/test/preview-app";

const { element, navigate, click, input, settle, waitFor } = setupPreviewApp('/app/clients');
const title = '[aria-label="Task title"]';
// 기능 : 고객부터 보관·삭제까지 하나의 실제 목 연결 흐름을 재검토한다.
describe('G25–G29 final connected review', () => {
  // 기능 : 새 작업의 첫 저장이 확정한 ID를 받아 이후 연결에서 재사용한다.
  async function createTask() {
    await click('[aria-label="New task in To Do"]'); await settle(); await input(title, 'Cleaning visit');
    await act(async () => element(title).dispatchEvent(new KeyboardEvent('keydown', {key:'Enter', bubbles:true})));
    await waitFor(() => { expect(new URLSearchParams(location.search).get('task')).not.toBe('new'); });
    return new URLSearchParams(location.search).get('task')!;
  }
  // 기능 : 부모와 자식 완료·담당자·댓글을 보존하며 동일 제목의 보관 및 삭제를 분리한다.
  it('connects a new client and project through tasks, children, comments, completion and lifecycle', async () => {
    await click('.client-list-tools a'); await settle();
    await input('#new-client-form input[placeholder="Smith Co."]', 'Cleaning Company');
    await input('#new-client-form input[placeholder="Jane Smith"]', 'Cleaning Contact');
    await input('#new-client-form input[type="email"]', 'cleaning@example.test'); await click('[form="new-client-form"]');
    await waitFor(() => { expect(element('h1').textContent).toBe('Cleaning Company'); });
    await click('[aria-label="Add project"]'); await settle(); await input('.project-title-field input', 'Weekly cleaning');
    await click('[form="new-project-form"]'); await waitFor(() => { expect(element('.project-title-row h1').textContent).toBe('Weekly cleaning'); });
    const project = location.pathname;
    expect(element('.project-context-row>a').getAttribute('href')).toContain('studio-a%3Aclient-new-1');
    await act(async () => Array.from(document.querySelectorAll<HTMLButtonElement>('[aria-label="Project sections"] button')).find(button => button.textContent === 'Tasks')!.click());
    const id = await createTask();
    await click('[aria-label="Task assignee"]'); await click('.task-properties .task-assignee-menu [role="option"]'); await settle();
    for (const child of ['Prepare supplies', 'Clean rooms']) {
      await click('.task-subtasks>.task-add'); await input('[aria-label="New subtask title"]', child); await click('.subtask-input-row button');
      await waitFor(() => { expect(element(`[aria-label="Subtask title ${child}"]`)).toBeDefined(); });
    }
    const childId = element('.subtask-item').dataset.subtaskId;
    await click('.subtask-row input[type="checkbox"]'); await settle();
    expect(element('[aria-label="Task status"]').textContent).toContain('To Do');
    await click('[aria-label="Assignee for Prepare supplies"]'); await click('.subtask-row .task-assignee-menu [role="option"]'); await settle();
    await act(async () => { const body = element<HTMLTextAreaElement>('[aria-label="Comment body"]'); Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!.call(body, 'Ready for the cleaning visit'); body.dispatchEvent(new Event('input', {bubbles:true})); });
    await click('.task-comment-form button[type="submit"]'); await waitFor(() => { expect(element('[data-activity-kind="comment"] p').textContent).toBe('Ready for the cleaning visit'); });
    const commentId = element('[data-activity-kind="comment"]').dataset.activityId;
    await click('[aria-label="Task status"]'); await click('.task-status-menu [role="option"]:last-of-type'); await settle();
    expect(element<HTMLInputElement>('.subtask-item:nth-of-type(2) input[type="checkbox"]').checked).toBe(false);
    await navigate(`/app/tasks?task=${id}`); await settle();
    expect(element('.subtask-item').dataset.subtaskId).toBe(childId); expect(element('[data-activity-kind="comment"]').dataset.activityId).toBe(commentId);
    expect(element('.subtask-item .task-avatar').textContent).toBe('A'); expect(element('[aria-label="Task status"]').textContent).toContain('Done');
    await navigate(`${project}?tab=Time+Tracking&task=${id}`); await settle();
    expect(element('[aria-label="Task title"]').getAttribute('value')).toBe('Cleaning visit');
    expect(element('.project-time-layout').textContent).not.toContain('$20.04');
    await click('.task-panel-title .task-actions>button'); await click('.task-panel-title [role="menuitem"]:nth-child(3)');
    await waitFor(() => { expect(document.querySelector('.task-dialog')).toBeNull(); });
    await navigate(`${project}?tab=Tasks`); await settle(); expect(document.querySelector(`[data-task-id="${id}"]`)).toBeNull();
    const secondId = await createTask(); expect(secondId).not.toBe(id);
    await click('.task-panel-title .task-actions>button'); await click('.task-panel-title [role="menuitem"]:nth-child(4)'); await click('.task-delete-confirm');
    await waitFor(() => { expect(document.querySelector('.task-dialog')).toBeNull(); });
    expect(document.querySelector(`[data-task-id="${secondId}"]`)).toBeNull();
    await click('.project-context-row>a'); await settle(); expect(element('.client-project-list').textContent).toContain('Weekly cleaning');
    await navigate('/app/projects/studio-a%3Ateam-project-2?tab=Time+Tracking'); await settle(); expect(element('.project-time-layout').textContent).toContain('$20.04');
    await navigate('/app/tasks'); await settle();
    expect(element('[data-task-id="studio-a:task-initial-chat-1"]')).toBeDefined(); expect(element('[data-task-id="studio-a:task-initial-chat-2"]')).toBeDefined();
  }, 25000);
  // 기능 : 기존 하위 입력에서 조합을 중단하고 돌아와도 다음 제목 확정이 막히지 않는다.
  it('recovers an existing child editor after composition ends by leaving the field', async () => {
    const path = '/app/tasks?task=studio-a:task-initial-chat-1';
    await navigate(path); await settle(); await click('.task-subtasks>.task-add');
    await input('[aria-label="New subtask title"]', 'Original child'); await click('.subtask-input-row button');
    await waitFor(() => { expect(element('.subtask-title')).toBeDefined(); });
    await act(async () => element('.subtask-title').focus());
    await act(async () => element('.subtask-title').dispatchEvent(new CompositionEvent('compositionstart', {bubbles:true})));
    await act(async () => element(title).focus());
    await act(async () => element('.subtask-title').focus()); await input('.subtask-title', 'Child after composition');
    await act(async () => element('.subtask-title').dispatchEvent(new KeyboardEvent('keydown', {key:'Enter', bubbles:true})));
    await settle(); await navigate(path + '&entry=again'); await settle();
    expect(element<HTMLInputElement>('.subtask-title').value).toBe('Child after composition');
  });
  // 기능 : 새 하위 입력과 부모 제목도 조합 중 초점 이탈 후 다음 저장을 허용한다.
  it('recovers creation and parent fields after an interrupted composition', async () => {
    const path = '/app/tasks?task=studio-a:task-initial-chat-1'; await navigate(path); await settle();
    await click('.task-subtasks>.task-add'); const child = '[aria-label="New subtask title"]';
    await act(async () => element(child).dispatchEvent(new CompositionEvent('compositionstart', {bubbles:true})));
    await act(async () => element(title).focus()); await act(async () => element(child).focus());
    await input(child, 'New child after composition'); await click('.subtask-input-row button'); await settle();
    expect.soft(document.querySelector('.subtask-title')).not.toBeNull();
    await navigate(path + '&entry=parent'); await settle(); await act(async () => element(title).focus());
    await act(async () => element(title).dispatchEvent(new CompositionEvent('compositionstart', {bubbles:true})));
    await act(async () => element('[aria-label="Task description"]').focus()); await act(async () => element(title).focus());
    await input(title, 'Parent after interrupted composition');
    await act(async () => element(title).dispatchEvent(new KeyboardEvent('keydown', {key:'Enter', bubbles:true})));
    await settle(); await navigate(path + '&entry=verify'); await settle();
    expect(element<HTMLInputElement>(title).value).toBe('Parent after interrupted composition');
  });
});

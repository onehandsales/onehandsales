import { act } from "react";
import { describe, expect, it } from "vitest";
import { setupPreviewApp } from "@/test/preview-app";

const task = "studio-a:task-initial-chat-1";
const { element, navigate, click, choose, input, settle, waitFor } = setupPreviewApp(`/app/tasks?task=${task}`);
const name = '[aria-label="Status name To Do"]';
// 기능 : 상태 정의와 개별 완료를 같은 작업 ID의 연결 화면에서 구분해 검증한다.
describe("G28 status entries", () => {
  // 기능 : 기존 작업 상태 메뉴에서 설정을 연다.
  async function settings() { await click('[aria-label="Task status"]'); await click('.task-status-settings-link'); }
  // 기능 : 실패 초안·이름과 색의 원자 저장·순서·IME 이탈을 검사한다.
  it("retries names and colors, reorders definitions and isolates composition", async () => {
    await choose('[aria-label="Task scenario"]', 'write-error'); await settle(); await settings();
    await act(async () => element(name).focus()); await input(name, 'Ready');
    await click('[aria-label="Color 4"]');
    await waitFor(() => { expect(element('.task-status-definitions [role="alert"]').textContent).toContain('preserved'); });
    expect.soft(element(name).getAttribute('aria-describedby')).toBe(element('.task-status-definitions [role="alert"]').id);
    await click('.task-status-definitions [role="alert"] button'); await settle();
    expect(element<HTMLInputElement>(name).value).toBe('Ready');
    await act(async () => element('[aria-label="Reorder Ready"]').dispatchEvent(new KeyboardEvent('keydown', {key:'ArrowDown', altKey:true, bubbles:true})));
    await settle(); expect(element('.task-definition input').getAttribute('aria-label')).toBe('Status name In Progress');
    await act(async () => element(name).focus());
    await act(async () => element(name).dispatchEvent(new CompositionEvent('compositionstart', {bubbles:true})));
    await click('.task-status-dialog > .dialog__surface > .dialog__close');
    await act(async () => element('[aria-label="Task title"]').focus()); await input('[aria-label="Task title"]', 'After status editor');
    await act(async () => element('[aria-label="Task title"]').dispatchEvent(new KeyboardEvent('keydown', {key:'Enter', bubbles:true})));
    await settle(); await navigate(`/app/tasks?task=${task}&entry=next`); await settle();
    expect(element<HTMLInputElement>('[aria-label="Task title"]').value).toBe('After status editor');
    await settings(); expect(element<HTMLInputElement>(name).value).toBe('Ready');
  });
  // 기능 : 대시보드 완료 행을 유지하고 상세·프로젝트 시간과 같은 ID를 사용한다.
  it("retains a completed dashboard row, its assignee and historical amount", async () => {
    await navigate('/app'); await settle();
    const row = `[data-dashboard-task-id="${task}"]`;
    expect.soft(document.querySelector(`${row} .task-avatar`)).not.toBeNull();
    expect.soft(document.querySelector(`${row} .task-actions`)).not.toBeNull();
    await click(`${row} input`); await settle();
    expect(element<HTMLInputElement>(`${row} input`).checked).toBe(true);
    expect(element(row).classList.contains('is-complete')).toBe(true);
    await click(`${row} a`); await settle();
    expect(new URLSearchParams(location.search).get('task')).toBe(task);
    expect(element('[aria-label="Task status"]').textContent).toContain('Done');
    await navigate(`/app/projects/studio-a%3Ateam-project-2?tab=Time+Tracking&task=${task}`); await settle();
    expect(element('.project-time-layout').textContent).toContain('$20.04');
    expect(element('[aria-label="Task status"]').textContent).toContain('Done');
  });
});

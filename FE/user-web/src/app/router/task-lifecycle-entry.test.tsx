import { act } from "react";
import { describe, expect, it } from "vitest";
import { setupPreviewApp } from "@/test/preview-app";

const task = 'studio-a:task-initial-chat-1';
const other = 'studio-a:task-initial-chat-2';
const { element, navigate, click, choose, settle, waitFor } = setupPreviewApp('/app/tasks');
const card = `[data-task-id="${task}"]`;
// 기능 : 보관·삭제의 대상과 이탈·취소·실패 경계를 실제 앱에서 검사한다.
describe('G29 lifecycle entries', () => {
  // 기능 : 지정한 카드의 동일 작업 메뉴만 연다.
  async function menu() { await click(`${card} .task-actions>button`); }
  // 기능 : 삭제 확인과 진행 중 요청은 같은 경로의 새 진입에서도 폐기한다.
  it('cancels pending archive and delete confirmations across navigation', async () => {
    await choose('[aria-label="Task scenario"]', 'slow'); await waitFor(() => { expect(element(card)).toBeDefined(); }, 5000);
    await menu(); await click(`${card} [role="menuitem"]:nth-child(3)`);
    await navigate('/app/tasks?review=next'); await settle(1700);
    expect.soft(document.querySelector(card)).not.toBeNull();
    await choose('[aria-label="Task scenario"]', 'normal'); await settle();
    await menu(); await click(`${card} [role="menuitem"]:nth-child(4)`);
    await navigate('/app/tasks?review=another'); await settle();
    expect(document.querySelector('.task-delete-dialog')).toBeNull();
    expect(element(card)).toBeDefined();
  }, 12000);
  // 기능 : 보관 재시도는 동명 다른 작업과 기록 금액을 보존하고 재진입을 차단한다.
  it('retries archive for one ID, closes its detail and preserves historical time', async () => {
    await choose('[aria-label="Task scenario"]', 'write-error'); await settle();
    await click(`${card} a`); await settle();
    await click('.task-panel-title .task-actions>button'); await click('.task-panel-title [role="menuitem"]:nth-child(3)');
    await waitFor(() => { expect(element('.task-panel-title [role="alert"]').textContent).toContain('preserved'); });
    await act(async () => { const archive = element('.task-panel-title [role="menuitem"]:nth-child(3)'); archive.click(); archive.click(); });
    await waitFor(() => { expect(document.querySelector('.task-dialog')).toBeNull(); });
    expect(document.querySelector(card)).toBeNull(); expect(element(`[data-task-id="${other}"]`)).toBeDefined();
    expect(element('.task-feedback span').textContent).toBe('Your task has been archived.');
    await navigate(`/app/projects/studio-a%3Ateam-project-2?tab=Time+Tracking&task=${task}`); await settle();
    expect(element('.project-time-layout').textContent).toContain('$20.04');
    expect(document.body.textContent).toContain('Task unavailable');
  });
  // 기능 : 확인 취소는 트리거로 복귀하고 확정 삭제는 원본 안내와 다른 작업을 유지한다.
  it('cancels deletion then removes only the confirmed ID once', async () => {
    await menu(); await click(`${card} [role="menuitem"]:nth-child(4)`);
    await click('.task-delete-dialog .dialog__close');
    expect(document.activeElement === element(`${card} .task-actions>button`)).toBe(true);
    await menu(); await click(`${card} [role="menuitem"]:nth-child(4)`);
    await choose('[aria-label="Task scenario"]', 'write-error'); await settle();
    await click('.task-delete-confirm');
    await waitFor(() => { expect(element('.task-delete-dialog [role="alert"]').textContent).toContain('preserved'); });
    expect(element(card)).toBeDefined();
    await act(async () => { const confirm = element('.task-delete-confirm'); confirm.click(); confirm.click(); });
    await waitFor(() => { expect(document.querySelector(card)).toBeNull(); });
    expect(element(`[data-task-id="${other}"]`)).toBeDefined();
    expect(element('.task-feedback span').textContent).toBe('Your task has been deleted.');
  });
  // 기능 : 대시보드의 동일 경로 재진입도 이전 파괴 작업을 확정하지 않는다.
  it('cancels a dashboard archive when its history entry changes', async () => {
    await choose('[aria-label="Task scenario"]', 'slow'); await navigate('/app');
    const row = `[data-dashboard-task-id="${task}"]`;
    await waitFor(() => { expect(element(row)).toBeDefined(); }, 5000);
    await click(`${row} input`); await navigate('/app?review=completion'); await settle(1700);
    expect(element<HTMLInputElement>(`${row} input`).checked).toBe(false);
    await click(`${row} .task-actions>button`); await click(`${row} [role="menuitem"]:nth-child(3)`);
    await navigate('/app?review=next'); await settle(1700);
    expect(document.querySelector(row)).not.toBeNull();
    expect(document.querySelector(`${row} .task-action-menu`)).toBeNull();
  }, 15000);
});

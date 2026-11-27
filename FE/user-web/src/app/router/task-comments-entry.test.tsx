import { act } from "react";
import { describe, expect, it } from "vitest";
import { setupPreviewApp } from "@/test/preview-app";

const task = "studio-a:task-initial-chat-1";
const { element, navigate, click, choose, settle, waitFor, input } = setupPreviewApp(`/app/tasks?task=${task}`);
const body = '[aria-label="Comment body"]';
// 기능 : 댓글의 초안·저장 결과·취소·활동 구분을 실제 앱과 같은 ID에서 검사한다.
describe("G27 comment entries", () => {
  // 기능 : 제어된 댓글 textarea에 일반 텍스트 입력을 전달한다.
  async function write(value: string) { await act(async () => { const node = element<HTMLTextAreaElement>(body); Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!.set!.call(node, value); node.dispatchEvent(new Event("input", { bubbles: true })); }); }
  // 기능 : 실패 후 입력을 유지하고 한 번만 등록하며 자동 활동과 댓글을 분리한다.
  it("retries literal comments once and preserves the same task through project time", async () => {
    await click('[aria-label="Task status"]'); await click('.task-status-menu [role="option"]:last-of-type'); await settle();
    await choose('[aria-label="Task scenario"]', "write-error"); await settle();
    const message = "To prepare a proposal after this call\n<b>plain text</b>";
    await write(message); await click('.task-comment-form button[type="submit"]');
    await waitFor(() => { expect(element('.task-comment-form [role="alert"]').textContent).toContain("preserved"); });
    expect(element<HTMLTextAreaElement>(body).value).toBe(message);
    expect.soft(element(body).getAttribute("aria-describedby")).toBe(element('.task-comment-form [role="alert"]').id);
    await act(async () => { const submit = element('.task-comment-form button[type="submit"]'); submit.click(); submit.click(); });
    await waitFor(() => { expect(document.querySelectorAll('[data-activity-kind="comment"]')).toHaveLength(1); expect(element<HTMLTextAreaElement>(body).value).toBe(""); });
    expect(element('[data-activity-kind="comment"] p').textContent).toBe(message);
    expect(element('[data-activity-kind="comment"] time').textContent).toBe('a few seconds ago');
    expect(element('[data-activity-kind="comment"] time').getAttribute('datetime')).toBe('2024-02-07T12:00:00Z');
    expect(document.querySelector('[data-activity-kind="comment"] b')).toBeNull();
    expect.soft(element('[data-activity-kind="comment"] .task-avatar').textContent).toBe("A");
    expect(document.activeElement === element(body)).toBe(true);
    const id = element('[data-activity-kind="comment"]').dataset.activityId;
    expect(element('[data-activity-kind="status"]').classList.contains('is-comment')).toBe(false);
    await navigate(`/app/projects/studio-a%3Ateam-project-2?tab=Time+Tracking&task=${task}`); await settle();
    expect(element('[data-activity-kind="comment"]').dataset.activityId).toBe(id);
    expect(element('.project-time-layout').textContent).toContain("$20.04");
  });
  // 기능 : 진행 댓글을 취소하면 본문과 초점을 복원하고 늦은 저장을 막는다.
  it("restores the draft focus after cancelling a pending comment", async () => {
    await choose('[aria-label="Task scenario"]', "slow"); await waitFor(() => { expect(element<HTMLTextAreaElement>(body).disabled).toBe(false); }, 5000);
    await write("Keep this draft"); await click('.task-comment-form button[type="submit"]');
    await act(async () => element('.task-comment-cancel').focus()); await click('.task-comment-cancel'); await settle(1700);
    expect(element<HTMLTextAreaElement>(body).value).toBe("Keep this draft");
    expect(document.activeElement === element(body)).toBe(true);
    expect(document.querySelector('[data-activity-kind="comment"]')).toBeNull();
    await navigate(`/app/tasks?task=${task}&entry=next`); await settle(); expect(element<HTMLTextAreaElement>(body).value).toBe("");
  }, 12000);
  // 기능 : 댓글 조합 입력을 떠나도 부모 필드의 저장이 잠기지 않는다.
  it("isolates comment composition and leaves Enter as a multiline edit", async () => {
    await act(async () => element(body).focus());
    await act(async () => element(body).dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true })));
    await write("조합"); await click('.task-comment-form button[type="submit"]'); await settle();
    expect(document.querySelector('[data-activity-kind="comment"]')).toBeNull();
    await act(async () => element('[aria-label="Task title"]').focus());
    await input('[aria-label="Task title"]', "Parent after comment");
    await act(async () => element('[aria-label="Task title"]').dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true })));
    await settle(); await navigate(`/app/tasks?task=${task}&entry=next`); await settle();
    expect(element<HTMLInputElement>('[aria-label="Task title"]').value).toBe("Parent after comment");
    const enter = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true });
    await act(async () => element(body).dispatchEvent(enter)); expect(enter.defaultPrevented).toBe(false);
  });
});

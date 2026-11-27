import { act } from "react";
import { describe, expect, it } from "vitest";
import { router } from "@/app/router/router";
import { setupPreviewApp } from "@/test/preview-app";

const { element, navigate, click, choose, input, settle, waitFor } = setupPreviewApp("/app/tasks");
const title = '[aria-label="Task title"]';
const task = "studio-a:task-initial-chat-1";
// 기능 : 생성과 재진입의 URL 문맥·요청 수명·입력 경계를 실제 앱에서 확인한다.
describe("G25 task entries", () => {
  // 기능 : 빈 생성 검증과 실패 재시도·중복 제출을 같은 작업 ID로 제한한다.
  it("keeps invalid and failed drafts accessible and retries creation once", async () => {
    await choose('[aria-label="Task scenario"]', "write-error"); await settle();
    await click(".task-new-group .task-primary"); await settle();
    await act(async () => element(title).dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true })));
    await waitFor(() => { expect(element(title).getAttribute("aria-invalid")).toBe("true"); });
    expect(document.activeElement === element(title)).toBe(true);
    await input(title, "Retry once"); await choose('[aria-label="Task project"]', "studio-a:team-project-2");
    await waitFor(() => { expect(element(".task-save-error").textContent).toContain("preserved"); });
    expect(element<HTMLInputElement>(title).value).toBe("Retry once");
    await act(async () => { const retry = element(".task-save-error button"); retry.click(); retry.click(); });
    await waitFor(() => { expect(new URLSearchParams(window.location.search).get("task")).not.toBe("new"); });
    await click(".task-dialog .dialog__close"); await settle();
    expect(Array.from(document.querySelectorAll(".task-card strong")).filter(node => node.textContent === "Retry once")).toHaveLength(1);
  });
  // 기능 : 검색·탭 전환·직접 패널 닫기가 외부 URL과 이력 상태를 보존한다.
  it("preserves foreign context through search, sections and direct close", async () => {
    await act(async () => router.navigate("/app/tasks?source=client#tasks", { state: { retained: true } })); await settle();
    await input('[aria-label="Search tasks"]', "Initial");
    expect.soft(window.location.hash).toBe("#tasks");
    expect.soft(router.state.location.state).toEqual({ retained: true });
    const key = router.state.location.key; await click('[aria-label="Task sections"] button:first-child');
    expect.soft(router.state.location.key).toBe(key);
    await click('[aria-label="Task sections"] button:nth-child(2)');
    expect.soft(window.location.hash).toBe("#tasks"); expect.soft(router.state.location.state).toEqual({ retained: true });
    await act(async () => router.navigate(`/app/tasks?source=client&task=${task}#tasks`, { state: { retained: true } })); await settle();
    await click(".task-dialog .dialog__close");
    expect(window.location.search + window.location.hash).toBe("?source=client#tasks");
    expect(router.state.location.state).toEqual({ retained: true });
  });
  // 기능 : 생성 성공의 ID 교체와 뒤로가기가 원래 프로젝트 문맥을 유지한다.
  it("creates one task with a fixed project and returns to its origin", async () => {
    const path = "/app/projects/studio-a%3Ateam-project-2?tab=Tasks&source=client#board";
    await act(async () => router.navigate(path, { state: { retained: true } })); await settle();
    await click('[aria-label="New task in To Do"]'); await settle();
    expect.soft(document.querySelector('[aria-label="Task project"]')).toBeNull();
    expect.soft(router.state.location.state).toEqual({ retained: true, taskPanelEntry: true });
    await input(title, "Entry review");
    await act(async () => element(title).dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true })));
    await waitFor(() => { expect(new URLSearchParams(window.location.search).get("task")).not.toBe("new"); });
    const id = new URLSearchParams(window.location.search).get("task")!;
    expect.soft(window.location.hash).toBe("#board");
    expect.soft(router.state.location.state).toEqual({ retained: true, taskPanelEntry: true });
    await click(".task-dialog .dialog__close"); await settle();
    expect(window.location.pathname + window.location.search + window.location.hash).toBe(path);
    expect(element(`[data-task-id="${id}"]`).textContent).toContain("Entry review");
    await navigate("/app/tasks"); await settle();
    expect(element(`[data-task-id="${id}"]`).textContent).toContain("Entry review");
  });
  // 기능 : 같은 ID의 다른 이력으로 이동하면 이전 초안과 지연 저장을 폐기한다.
  it("cancels pending edits when the same task is entered again", async () => {
    await choose('[aria-label="Task scenario"]', "slow"); await settle(1700);
    await navigate(`/app/tasks?task=${task}&entry=1`); await waitFor(() => { expect(element<HTMLInputElement>(title).value).toBe("Initial Chat"); }, 5000);
    await input(title, "Must not save");
    await act(async () => element(title).dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true })));
    await navigate(`/app/tasks?task=${task}&entry=2`); await settle(1700);
    expect(element<HTMLInputElement>(title).value).toBe("Initial Chat");
    await click(".task-dialog .dialog__close"); await navigate(`/app/tasks?task=${task}`);
    await waitFor(() => { expect(element<HTMLInputElement>(title).value).toBe("Initial Chat"); }, 5000);
  }, 15000);
  // 기능 : 조합 중인 검색의 늦은 종료가 이동한 화면의 검색을 덮어쓰지 않는다.
  it("discards composition across navigation and cancels filter drafts", async () => {
    const search = '[aria-label="Search tasks"]';
    await act(async () => element(search).dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true })));
    await input(search, "미완료"); await navigate("/app/tasks?source=next");
    await act(async () => element(search).dispatchEvent(new CompositionEvent("compositionend", { bubbles: true })));
    expect(element<HTMLInputElement>(search).value).toBe("");
    expect(new URLSearchParams(window.location.search).has("taskQ")).toBe(false);
    await click(".task-toolbar-button"); await choose('[aria-label="Filter task status"]', "Done");
    await click(".dialog__close");
    expect(new URLSearchParams(window.location.search).has("taskStage")).toBe(false);
    await click(".task-toolbar-button"); await choose('[aria-label="Filter task status"]', "Done");
    await click(".task-filter-fields button");
    expect(new URLSearchParams(window.location.search).get("taskStage")).toBe("Done");
  });
  // 기능 : 조합 확정 키와 취소 키를 저장이나 모달 닫기로 전달하지 않는다.
  it("suppresses composing Enter and Escape in the task editor", async () => {
    await navigate(`/app/tasks?task=${task}`); await settle(); await input(title, "조합중");
    await act(async () => element(title).dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true })));
    for (const key of ["Enter", "Escape"]) {
      const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true });
      await act(async () => element(title).dispatchEvent(event)); expect(event.defaultPrevented).toBe(true);
    }
    await settle(); expect(element<HTMLInputElement>(title).disabled).toBe(false);
    await click(".task-dialog .dialog__close"); await navigate(`/app/tasks?task=${task}`); await settle();
    expect(element<HTMLInputElement>(title).value).toBe("Initial Chat");
  });
});

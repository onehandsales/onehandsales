import { act } from "react";
import { describe, expect, it } from "vitest";
import { router } from "@/app/router/router";
import { setupPreviewApp } from "@/test/preview-app";

const { element, click, input, settle, waitFor } = setupPreviewApp("/app/projects");
// 기능 : 고객·프로젝트 연결 재검토에서 발견한 생성 상태·시간 행 진입·태그 초점 경계를 검증한다.
describe("G21-G24 additional review", () => {
  // 기능 : 생성 결과를 한 번 보여준 뒤 표를 왕복해도 사용자 스크롤을 보존하고 생성 안내를 재생하지 않는다.
  it("consumes creation state before toggling views and retains the board position", async () => {
    await click(".project-list-tools a"); await settle();
    await input(".project-title-field input", "Review project");
    await click(".project-client-trigger"); await click('.project-client-menu [role="option"]:first-child');
    await click('[form="new-project-form"]');
    await waitFor(() => { expect(element('[data-project-id="studio-a:project-new-1"]').textContent).toContain("Review project"); });
    expect(element(".client-notice").textContent).toContain("Project created successfully");
    element(".project-board").scrollLeft = 420;
    await click('[aria-label="Project views"] button:nth-child(2)');
    expect.soft(document.querySelector(".client-notice")).toBeNull();
    await click('[aria-label="Project views"] button:first-child');
    expect.soft(element(".project-board").scrollLeft).toBe(420);
    expect.soft(document.querySelector(".client-notice")).toBeNull();
    expect(element('[data-project-id="studio-a:project-new-1"]').textContent).toContain("Review project");
  });
  // 기능 : 기존 시간 기록에서 작업을 열고 닫아도 원래 탭·외부 query·hash·이력 상태와 금액을 보존한다.
  it("preserves the time entry context through the existing task panel", async () => {
    const path = "/app/projects/studio-a%3Ateam-project-2?tab=Time+Tracking&source=client#time";
    await act(async () => router.navigate(path, { state: { retained: true } })); await settle();
    await click(".project-time-task");
    await waitFor(() => { expect(element<HTMLInputElement>('[aria-label="Task title"]').value).toBe("Initial Chat"); });
    expect.soft(window.location.hash).toBe("#time");
    expect.soft(router.state.location.state).toEqual({ retained: true, taskPanelEntry: true });
    expect(new URLSearchParams(window.location.search).get("source")).toBe("client");
    expect(new URLSearchParams(window.location.search).get("tab")).toBe("Time Tracking");
    expect(new URLSearchParams(window.location.search).get("task")).toBe("studio-a:task-initial-chat-1");
    await click(".task-dialog .dialog__close"); await settle();
    expect(window.location.pathname + window.location.search + window.location.hash).toBe(path);
    expect(router.state.location.state).toEqual({ retained: true });
    expect(element(".project-time-layout").textContent).toContain("$20.04");
    expect(document.querySelector(".task-dialog")).toBeNull();
  });
  // 기능 : 태그 내부 입력을 취소하거나 저장하면 열린 모달의 다음 편집 버튼으로 초점을 돌려준다.
  it("restores tag controls after cancelling and saving an inner editor", async () => {
    await click('[data-project-id="studio-a:team-project-2"] .project-actions-trigger');
    await act(async () => document.querySelector<HTMLButtonElement>('[role="menuitem"]')!.click());
    await click(".project-tags-body > button");
    expect(document.activeElement).toBe(element('[role="combobox"]'));
    await act(async () => element('[role="combobox"]').dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true })));
    expect.soft(document.activeElement === element(".project-tags-body > button")).toBe(true);
    await click(".project-tags-body > button"); await input('[role="combobox"]', "Review tag"); await click(".project-tag-create");
    await waitFor(() => { expect(element(".project-linked-tags").textContent).toContain("Review tag"); });
    expect.soft(document.activeElement === element(".project-linked-tags > button")).toBe(true);
    await click(".project-linked-tags > button"); await click('[aria-label="Rename tag Review tag"]');
    expect(document.activeElement).toBe(element(".project-tag-rename input"));
    await act(async () => element(".project-tag-rename input").dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true })));
    expect.soft(document.activeElement === element('[aria-label="Rename tag Review tag"]')).toBe(true);
    expect(element(".project-tags-dialog").hasAttribute("open")).toBe(true);
  });
});

import { act } from "react";
import { describe, expect, it, vi } from "vitest";
import { router } from "@/app/router/router";
import { setupPreviewApp } from "@/test/preview-app";

const { element, navigate, click, choose, input, settle, waitFor } = setupPreviewApp("/app/tasks?tab=Templates");
// 기능 : 이름 있는 빈 템플릿을 저장하고 구성 작업 편집으로 진입한다.
async function openEditor() {
  await click(".task-templates-intro .task-primary"); await input(".template-name-dialog input", "Default Task");
  await click(".template-name-dialog [type=submit]");
  await waitFor(() => expect(element(".template-heading h2").textContent).toBe("Default Task"));
  expect(document.querySelectorAll("[data-template-task-id]")).toHaveLength(0);
  await click(".template-heading > .task-primary");
}
// 기능 : 실제 입력의 키 이벤트를 조합 상태와 함께 전달한다.
async function key(selector: string, key: string, composing = false) {
  await act(async () => element(selector).dispatchEvent(new KeyboardEvent("keydown", { key, isComposing: composing, bubbles: true, cancelable: true })));
}
// 기능 : 템플릿 편집 진입·저장 경계·초점·첨부의 로컬 수명을 실제 앱에서 검증한다.
describe("G30 template writing entries", () => {
  it("preserves foreign URL and state through creation, direct close and rename", async () => {
    const base = "/app/tasks?tab=Templates&source=client#templates";
    await act(async () => router.navigate(base, { state: { retained: true } })); await settle();
    await click(".task-templates-intro .task-primary");
    expect.soft(location.hash).toBe("#templates");
    expect.soft(router.state.location.state).toMatchObject({ retained: true, templateDialogEntry: true });
    await input(".template-name-dialog input", "Context"); await click(".template-name-dialog [type=submit]");
    await waitFor(() => expect(element(".template-heading h2").textContent).toBe("Context"));
    expect.soft(location.hash).toBe("#templates"); expect.soft(router.state.location.state).toEqual({ retained: true });
    const template = new URLSearchParams(location.search).get("template");
    await act(async () => router.navigate(base.replace("#templates", `&template=${template}&templateDialog=rename#templates`), { state: { retained: true } })); await settle();
    await input(".template-name-dialog input", "Discard"); await click(".template-name-dialog .dialog__close");
    expect.soft(location.hash).toBe("#templates"); expect.soft(router.state.location.state).toEqual({ retained: true });
    expect(element(".template-heading h2").textContent).toBe("Context");
  });
  it("cancels pending creation and task saves when the same editor receives a new history entry", async () => {
    await choose('[aria-label="Template scenario"]', "slow");
    await click(".task-templates-intro .task-primary"); await input(".template-name-dialog input", "Cancelled");
    await click(".template-name-dialog [type=submit]");
    await navigate(location.pathname + location.search + "&entry=next"); await settle(1700);
    expect.soft(document.querySelector(".template-heading")).toBeNull();
    expect.soft(document.querySelector<HTMLInputElement>(".template-name-dialog input")?.value).toBe("");
    await choose('[aria-label="Template scenario"]', "normal"); await navigate("/app/tasks?tab=Templates"); await settle();
    await openEditor(); await input('.template-editor-fields > label:first-child input', "Cancelled task");
    await choose('[aria-label="Template scenario"]', "slow"); await click(".template-editor-footer [type=submit]");
    await navigate(location.pathname + location.search + "&entry=next"); await settle(1700);
    expect.soft(document.querySelectorAll("[data-template-task-id]")).toHaveLength(0);
    expect.soft(document.querySelector<HTMLInputElement>('.template-editor-fields > label:first-child input')?.value).toBe("");
  });
  it("isolates child composition, restores focus and commits children only with Save Task", async () => {
    await openEditor(); await input('.template-editor-fields > label:first-child input', "Parent");
    const child = '[aria-label="New template subtask"]';
    await act(async () => { element(child).focus(); element(child).dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true })); });
    await input(child, "Send invite"); await key(child, "Escape", true);
    expect.soft(document.querySelector(child)).not.toBeNull();
    if (!document.querySelector(child)) await click(".template-subtasks > .template-text-button");
    await act(async () => element(child).blur()); await input(child, "Send invite"); await key(child, "Enter");
    expect.soft(document.querySelectorAll(".template-subtask")).toHaveLength(1);
    await settle(40); expect.soft(document.activeElement).toBe(document.querySelector(".template-subtasks > .template-text-button"));
    expect(document.querySelectorAll("[data-template-task-id]")).toHaveLength(0);
    await click(".template-editor-footer [type=submit]");
    await waitFor(() => expect(document.querySelectorAll("[data-template-task-id]")).toHaveLength(1));
    await click(".template-task-list summary"); expect(element(".template-task-detail").textContent).toContain("Send invite");
    await click(".template-task-detail > button"); await click(".template-subtasks > .template-text-button"); await input(child, "Discarded");
    await click(".template-subtask-form button"); await click(".template-editor-dialog .dialog__close");
    await waitFor(() => expect(document.querySelector(".template-editor-dialog")).toBeNull());
    await click(".template-task-detail > button"); expect(element(".template-subtasks").textContent).not.toContain("Discarded");
  });
  it("links invalid task and child inputs to errors and recovers from a failed save", async () => {
    await openEditor(); await click(".template-editor-footer [type=submit]"); await settle();
    const title = '.template-editor-fields > label:first-child input';
    expect.soft(element(title).getAttribute("aria-invalid")).toBe("true");
    expect.soft(document.activeElement).toBe(element(title));
    await input(title, "R"); expect.soft(document.activeElement).toBe(element(title));
    await input(title, "Recover"); await input('[aria-label="New template subtask"]', "Unsaved");
    await click(".template-editor-footer [type=submit]");
    expect.soft(document.activeElement).toBe(element('[aria-label="New template subtask"]'));
    await key('[aria-label="New template subtask"]', "Escape");
    await choose('[aria-label="Template scenario"]', "write-error"); await click(".template-editor-footer [type=submit]");
    await waitFor(() => expect(element(".template-editor-fields").textContent).toContain("preserved"));
    expect(element<HTMLInputElement>(title).value).toBe("Recover");
    await act(async () => { element(".template-editor-footer [type=submit]").click(); element(".template-editor-footer [type=submit]").click(); });
    await waitFor(() => expect(document.querySelectorAll("[data-template-task-id]")).toHaveLength(1));
  });
  it("recovers name and parent composition after blur and restores cancelled save focus", async () => {
    await click(".task-templates-intro .task-primary"); await click(".template-name-dialog [type=submit]"); await settle();
    expect.soft(element(".template-name-dialog input").getAttribute("aria-invalid")).toBe("true");
    expect.soft(document.activeElement).toBe(element(".template-name-dialog input"));
    await input(".template-name-dialog input", "Composed");
    await act(async () => element(".template-name-dialog input").dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true })));
    await key(".template-name-dialog input", "Escape", true);
    expect(document.querySelector(".template-name-dialog")).not.toBeNull();
    await act(async () => element(".template-name-dialog input").blur());
    await click(".template-name-dialog [type=submit]");
    await waitFor(() => expect(element(".template-heading h2").textContent).toBe("Composed"));
    await click('[aria-label="Edit template name"]'); await input(".template-name-dialog input", "Cancelled rename");
    await choose('[aria-label="Template scenario"]', "slow"); await click(".template-name-dialog [type=submit]");
    await click(".template-name-dialog form > button:last-child"); await settle(50);
    expect(document.activeElement).toBe(element(".template-name-dialog input"));
    await click(".template-name-dialog .dialog__close"); await settle(1700);
    expect(element(".template-heading h2").textContent).toBe("Composed");
    await choose('[aria-label="Template scenario"]', "normal"); await click(".template-heading > .task-primary");
    const title = '.template-editor-fields > label:first-child input';
    await act(async () => { element(title).focus(); element(title).dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true })); });
    await input(title, "Parent after blur"); await key(title, "Enter", true); await act(async () => element(title).blur());
    await click(".template-editor-footer [type=submit]");
    await waitFor(() => expect(document.querySelectorAll("[data-template-task-id]")).toHaveLength(1));
  });
  it("keeps local image retries and child saves inside the parent draft and discards late reads", async () => {
    vi.stubGlobal("createImageBitmap", vi.fn().mockRejectedValueOnce(new Error("decode")).mockResolvedValue({ close: vi.fn() }));
    vi.stubGlobal("URL", URL); const create = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:template-test");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    await openEditor(); await input('.template-editor-fields > label:first-child input', "Image task");
    const file = new File(["local"], "local.png", { type: "image/png" });
    await act(async () => { const field = element<HTMLInputElement>('[aria-label="Template task file"]'); Object.defineProperty(field, "files", { configurable: true, value: [file] }); field.dispatchEvent(new Event("change", { bubbles: true })); });
    expect(element(".template-files [role=alert]").textContent).toContain("Unable");
    await click(".template-files [role=alert] button"); expect(document.querySelectorAll(".template-file-card")).toHaveLength(1);
    await click(".template-editor-footer [type=submit]");
    await waitFor(() => expect(document.querySelectorAll("[data-template-task-id]")).toHaveLength(1));
    await click(".template-task-list summary"); expect(element(".template-task-detail").textContent).toContain("local.png"); expect(create).toHaveBeenCalled();
    await click(".template-task-detail > button");
    let finish: ((value: { close: () => void }) => void) | undefined;
    vi.stubGlobal("createImageBitmap", vi.fn(() => new Promise(resolve => { finish = resolve; })));
    await act(async () => { const field = element<HTMLInputElement>('[aria-label="Template task file"]'); Object.defineProperty(field, "files", { configurable: true, value: [new File(["late"], "late.png", { type: "image/png" })] }); field.dispatchEvent(new Event("change", { bubbles: true })); });
    await click(".template-editor-dialog .dialog__close"); await act(async () => finish?.({ close() {} }));
    await click(".template-task-detail > button"); expect(element(".template-files").textContent).not.toContain("late.png");
  });
});

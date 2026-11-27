import { act } from "react";
import { describe, expect, it } from "vitest";
import { setupPreviewApp } from "@/test/preview-app";

const { element, navigate, click, choose, input, settle, waitFor } = setupPreviewApp("/app/projects");
const doe = '[data-project-id="studio-a:team-project-2"]';
// 기능 : 보드 카드의 실제 메뉴로 태그 편집을 연다.
async function openTags(card = doe) { await click(`${card} .project-actions-trigger`); await act(async () => document.querySelector<HTMLButtonElement>('[role="menuitem"]')!.click()); }
// 기능 : 입력에 실제 키 이벤트를 전달하고 기본 동작 차단 여부를 반환한다.
async function key(selector: string, value: string, composing = false) { const event = new KeyboardEvent("keydown", { key: value, isComposing: composing, bubbles: true, cancelable: true }); await act(async () => element(selector).dispatchEvent(event)); return event; }
// 기능 : 단계·태그의 저장 연결과 실패·조합·이탈 경계를 검증한다.
describe("G23 stages and tags", () => {
  // 기능 : 태그 조합 Escape는 편집을 닫지 않고 확정 이후 정상 추가가 가능하다.
  it("keeps tag composition open and commits only after confirmation", async () => {
    await openTags(); await click(".project-tags-body > button"); await input('[role="combobox"]', "Cleaning");
    await act(async () => element('[role="combobox"]').dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true })));
    expect((await key('[role="combobox"]', "Escape", true)).defaultPrevented).toBe(true); expect(document.querySelector('[role="combobox"]')).not.toBeNull();
    await act(async () => element('[role="combobox"]').dispatchEvent(new CompositionEvent("compositionend", { bubbles: true })));
    await key('[role="combobox"]', "Enter"); await settle(); await settle(); expect(element(".project-linked-tags").textContent).toContain("Cleaning");
    await click(".project-tags-dialog .dialog__close"); expect(element(doe).textContent).toContain("Cleaning");
  });
  // 기능 : 완전 일치 태그가 부분 일치 후보 뒤에 있어도 Enter로 정확한 ID를 연결한다.
  it("selects the exact tag instead of the first partial match", async () => {
    await openTags(); await click(".project-tags-body > button"); await input('[role="combobox"]', "Sam"); await key('[role="combobox"]', "Enter"); await settle(); await settle(); await click(".project-tags-dialog .dialog__close");
    await openTags('[data-project-id="studio-a:team-project-3"]'); await click(".project-tags-body > button"); await input('[role="combobox"]', "  sam  "); await key('[role="combobox"]', "Enter"); await settle(); await settle();
    expect(element(".project-linked-tags .project-tag").textContent).toBe("Sam");
  });
  // 기능 : 같은 경로의 새 이력은 태그 모달과 지연 저장을 폐기한다.
  it("discards pending tags when the board entry changes", async () => {
    await choose('[aria-label="Project scenario"]', "slow"); await settle(1700); await openTags(); await click(".project-tags-body > button"); await input('[role="combobox"]', "Aborted tag"); await click(".project-tag-create");
    await navigate("/app/projects?visit=2"); expect(document.querySelector(".project-tags-dialog")).toBeNull(); await settle(3300); expect(element(doe).textContent).not.toContain("Aborted tag");
  }, 12000);
  // 기능 : 실패한 키보드 이동은 배치를 유지하고 재시도 후 양쪽 열과 같은 열 순서를 갱신한다.
  it("retries a keyboard move and reorders within the destination stage", async () => {
    await choose('[aria-label="Project scenario"]', "write-error"); await settle(); await click(`${doe} .project-keyboard-move`); await choose('[aria-label="Stage"]', "In Progress"); await choose('[aria-label="Position"]', "studio-a:team-project-1"); await click('[form="project-move-form"]'); await waitFor(() => { expect(element('#project-move-form [role="alert"]').textContent).toBeTruthy(); });
    expect(element(doe).closest("section")?.getAttribute("aria-label")).toBe("New Lead");
    await click('[form="project-move-form"]'); await settle(); await settle();
    expect(Array.from(document.querySelectorAll<HTMLElement>('.project-column[aria-label="In Progress"] [data-project-id]'), node => node.dataset.projectId)).toEqual(["studio-a:team-project-2", "studio-a:team-project-1"]);
    expect(element('.project-column[aria-label="New Lead"] .project-column-heading > span').textContent).toBe("1");
  });
  // 기능 : 드래그 취소와 드롭은 같은 카드 ID·태그·양쪽 건수를 보존하며 저장한다.
  it("cancels a drag and then drops the same card into another stage", async () => {
    const card = '[data-project-id="studio-a:team-project-1"]';
    // 기능 : jsdom에 없는 DataTransfer만 대체해 실제 React 드래그 처리기를 호출한다.
    async function drag(selector: string, type: string) { const event = new Event(type, { bubbles: true, cancelable: true }); Object.defineProperty(event, "dataTransfer", { value: { setData() {}, effectAllowed: "", dropEffect: "" } }); await act(async () => element(selector).dispatchEvent(event)); }
    await drag(card, "dragstart"); await key(".project-board", "Escape"); await drag('.project-column[aria-label="Contract Signed"]', "drop"); await settle(); expect(element(card).closest("section")?.getAttribute("aria-label")).toBe("In Progress");
    await drag(card, "dragstart"); await drag('.project-column[aria-label="Contract Signed"]', "drop"); await settle(); await settle();
    expect(element(card).closest("section")?.getAttribute("aria-label")).toBe("Contract Signed"); expect(element(card).textContent).toContain("Sample"); expect(element('.project-column[aria-label="In Progress"] .project-column-heading > span').textContent).toBe("0");
  });
  // 기능 : 태그 이름 오류의 초안·연결을 보존하고 수정 저장과 연결 해제를 검증한다.
  it("preserves invalid rename input and then saves and unlinks the tag", async () => {
    await openTags('[data-project-id="studio-a:team-project-1"]'); await click(".project-linked-tags > button"); await click('[aria-label="Rename tag Sample"]'); await input(".project-tag-rename input", " "); await click(".project-tag-rename .client-primary"); await settle();
    expect(element(".project-tag-rename input").getAttribute("aria-invalid")).toBe("true"); expect(element(".project-tags-body [role=alert]").textContent).toContain("1–60");
    await input(".project-tag-rename input", "Priority"); await click(".project-tag-rename .client-primary"); await settle(); await settle();
    await click('[aria-label="Remove tag Priority from project"]'); await settle(); await settle(); expect(document.querySelector(".project-linked-tags")).toBeNull();
    await click(".project-tags-body > button"); expect(element('[role="listbox"]').textContent).toContain("Priority");
  });
  // 기능 : 단계의 연속 선택은 마지막 의도만 저장하며 상세의 문서·금액은 그대로 둔다.
  it("keeps the latest stage choice and cancels a later choice on navigation", async () => {
    await navigate("/app/projects/studio-a%3Ateam-project-2"); await settle(); await choose('[aria-label="Project scenario"]', "slow");
    await click(".project-stage-control > button"); await click('[role="menuitemradio"]:nth-child(2)'); await click(".project-stage-control > button"); await click('[role="menuitemradio"]:nth-child(3)'); await settle(3300);
    expect(element(".project-stage-control > button").textContent).toContain("Contract Signed"); expect(element(".project-overview-grid").textContent).toContain("No documents");
    await click(".project-stage-control > button"); await click('[role="menuitemradio"]:nth-child(5)'); await navigate("/app/projects/studio-a%3Ateam-project-2?visit=2"); await settle(3300);
    expect(element(".project-stage-control > button").textContent).toContain("Contract Signed");
  }, 15000);
});

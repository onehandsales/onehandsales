import { act } from "react";
import { describe, expect, it } from "vitest";
import { setupPreviewApp } from "@/test/preview-app";

const { element, navigate, click, choose, input, settle } = setupPreviewApp("/app/settings/branding");
// 기능 : 관찰된 목록 항목을 실제 제어로 선택한다.
async function header(index: number) { await click('[role="combobox"]'); await click(`[role="option"]:nth-child(${index})`); }
// 기능 : 문서 기본값의 초안·저장·이력과 회사 설정 소비 경계를 실제 앱에서 검증한다.
describe("G16 branding journeys", () => {
  // 기능 : 미리보기 선택을 취소하면 저장값으로 돌아가고 브랜드 저장 뒤 회사 저장이 헤더를 덮지 않는지 확인한다.
  it("separates preview and saved defaults across company settings", async () => {
    await click('[role="combobox"]');
    expect(Array.from(document.querySelectorAll('[role="option"]'), node => node.textContent)).toEqual(["No image", "Abstract", "Plant", "Desk", "Custom Header"]);
    await click('[role="option"]:nth-child(2)'); expect(element(".sample-invoice").dataset.header).toBe("abstract");
    expect(document.querySelector(".company-save-notice")).toBeNull();
    await click(".brand-edit-actions button"); await settle(); expect(element(".sample-invoice").dataset.header).toBe("none");
    await header(3); await click(".company-save"); await settle(); expect(element(".company-save-notice").textContent).toContain("branding settings have been saved");
    await navigate("/app/settings/company"); await settle(); await input('[aria-label="Company Name"]', "Company after brand"); await click(".company-save"); await settle();
    await navigate("/app/settings/branding"); await settle(); expect(element(".sample-invoice").dataset.header).toBe("plant");
  });
  // 기능 : 같은 경로의 새 이력은 저장을 취소하고 초안을 보존하며 명시적 재시도만 저장한다.
  it("cancels same-route pending saves without losing the draft", async () => {
    await header(3); await choose(".company-tools select", "slow"); await click(".company-save");
    await navigate("/app/settings/branding?visit=2#preview"); await settle(1600);
    expect(element(".sample-invoice").dataset.header).toBe("plant"); expect(document.querySelector(".company-save-notice")).toBeNull();
    await choose(".company-tools select", "normal"); await click(".brand-edit-actions button"); await settle();
    expect(element(".sample-invoice").dataset.header).toBe("none");
    await header(3); await choose(".company-tools select", "save-error"); await click(".company-save"); await settle();
    expect(element(".company-error").textContent).toContain("still here"); expect(element(".sample-invoice").dataset.header).toBe("plant");
    await click(".company-save"); await settle(); await navigate("/app/settings/branding?visit=3");
    expect(document.querySelector(".company-save-notice")).toBeNull();
  });
  // 기능 : 키보드 취소와 미수록 옵션 안내는 선택을 바꾸지 않고 새 이력에 팝업을 남기지 않는다.
  it("closes dropdowns and unavailable notices on navigation without changing defaults", async () => {
    await click('[role="combobox"]');
    await act(async () => element('[role="combobox"]').dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })));
    expect(element('[role="combobox"]').getAttribute("aria-expanded")).toBe("false");
    await click('[role="combobox"]'); await navigate("/app/settings/branding?popup=next");
    expect(document.querySelector('[role="listbox"]')).toBeNull();
    await header(5); expect(element("dialog h2").textContent).toBe("Custom Header");
    expect(element(".sample-invoice").dataset.header).toBe("none");
    await navigate("/app/settings/branding?popup=closed"); expect(document.querySelector("dialog")).toBeNull();
    expect(element<HTMLInputElement>('.brand-white-label input:checked').parentElement?.textContent).toBe("Show Bonsai branding");
  });
  // 기능 : 처리 중 새 선택이 이전 저장보다 우선하며 이전 응답이 선택이나 저장값을 되돌리지 않게 한다.
  it("lets newer header intent cancel an older save", async () => {
    await header(2); await choose(".company-tools select", "slow"); await click(".company-save");
    await header(3); await settle(1600); expect(element(".sample-invoice").dataset.header).toBe("plant");
    expect(document.querySelector(".company-save-notice")).toBeNull(); await choose(".company-tools select", "normal");
    await click(".company-save"); await settle(); await navigate("/app"); await navigate("/app/settings/branding"); await settle();
    expect(element(".sample-invoice").dataset.header).toBe("plant");
  });
});

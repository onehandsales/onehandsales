import { act } from "react";
import { describe, expect, it } from "vitest";
import { setupPreviewApp } from "@/test/preview-app";

const { element, navigate, click, input, settle } = setupPreviewApp("/app/settings/company");
// 기능 : 설정 페이지와 초기 대시보드 모달의 동일 주소 편집기를 연다.
async function openAddress(surface: string) {
  if (surface === "dashboard") { await navigate("/app"); await settle(); await click(".setup-checklist-detail .setup-solid"); await settle(); }
  await click(".company-address-summary");
}
// 기능 : 주소 첫 입력에 실제 React 조합 이벤트를 전달한다.
async function composition(type: "compositionstart" | "compositionend") {
  await act(async () => element('.company-address-fields input[id$="line1"]').dispatchEvent(new CompositionEvent(type, { bubbles: true })));
}
// 기능 : 원본 주소 편집의 두 소비 화면에서 조합 중 취소와 이후 저장을 구분한다.
describe("G15 address composition boundaries", () => {
  // 기능 : 조합 확정 전 Escape가 주소나 부모 모달을 닫지 않고 조합 종료 후에는 주소만 취소한다.
  it.each(["settings", "dashboard"])("keeps %s address open during composition Escape", async surface => {
    await openAddress(surface); await composition("compositionstart");
    await act(async () => element('.company-address-fields input[id$="line1"]').dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", isComposing: true, bubbles: true, cancelable: true })));
    expect(element(".company-address-fields")).toBeTruthy();
    if (surface === "dashboard") expect(element<HTMLDialogElement>("dialog").open).toBe(true);
    await composition("compositionend");
    await act(async () => element('.company-address-fields input[id$="line1"]').dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true })));
    expect(document.querySelector(".company-address-fields")).toBeNull(); expect(document.activeElement).toBe(element(".company-address-summary"));
    if (surface === "dashboard") expect(element<HTMLDialogElement>("dialog").open).toBe(true);
  });
  // 기능 : 조합 종료 이벤트 없이 주소를 명시 취소해도 다음 주소 저장과 회사 전체 저장이 잠기지 않는다.
  it.each(["settings", "dashboard"])("can save %s company after cancelling an unfinished address composition", async surface => {
    await openAddress(surface); await composition("compositionstart"); await click(".company-address-actions button:first-child");
    await click(".company-address-summary"); await input('.company-address-fields input[id$="line1"]', "Saved after cancelled composition");
    await click(".company-address-actions button:last-child");
    expect(document.querySelector(".company-address-fields")).toBeNull(); await click(".company-save"); await settle();
    await navigate("/app"); await navigate("/app/settings/company?after=composition"); await settle();
    expect(element(".company-address-summary").textContent).toContain("Saved after cancelled composition");
  });
});

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "../app";
import { router } from "./router";

let container: HTMLDivElement;
let root: Root;
let wide = true;
const listeners = new Set<() => void>();
const originalShow = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, "showModal");
const originalClose = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, "close");
// 기능 : 실제 라우터와 저장소를 조립하고 jsdom에 없는 브라우저 표시 기능만 대체한다.
beforeEach(async () => {
  wide = true; listeners.clear();
  vi.stubGlobal("matchMedia", (query: string) => ({ get matches() { return query === "(min-width: 761px)" && wide; }, media: query, addEventListener(_type: string, callback: () => void) { listeners.add(callback); }, removeEventListener(_type: string, callback: () => void) { listeners.delete(callback); } }));
  vi.stubGlobal("scrollTo", () => {});
  vi.stubGlobal("IntersectionObserver", class { observe() {} disconnect() {} unobserve() {} });
  // 기능 : 네이티브 모달 표시만 대체하며 실제 브라우저의 초점 잠금을 검증한 것으로 간주하지 않는다.
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", { configurable: true, value: function showModal(this: HTMLDialogElement) { this.open = true; } });
  // 기능 : 모달 닫기 속성을 동기화한다.
  Object.defineProperty(HTMLDialogElement.prototype, "close", { configurable: true, value: function close(this: HTMLDialogElement) { this.open = false; } });
  container = document.createElement("div"); document.body.append(container); root = createRoot(container);
  await router.navigate("/components", { replace: true }); await act(async () => root.render(<App />));
  await act(async () => { const session = element<HTMLSelectElement>(".preview-tools label:first-of-type select"); session.value = "preview-a"; session.dispatchEvent(new Event("change", { bubbles: true })); });
  await navigate("/app");
});
// 기능 : 렌더와 브라우저 대체를 정리하여 실행 간 상태가 새지 않게 한다.
afterEach(async () => {
  await act(async () => root.unmount()); container.remove(); vi.restoreAllMocks(); vi.unstubAllGlobals();
  if (originalShow) Object.defineProperty(HTMLDialogElement.prototype, "showModal", originalShow); else Reflect.deleteProperty(HTMLDialogElement.prototype, "showModal");
  if (originalClose) Object.defineProperty(HTMLDialogElement.prototype, "close", originalClose); else Reflect.deleteProperty(HTMLDialogElement.prototype, "close");
});
// 기능 : 필수 요소가 빠졌을 때 즉시 해당 시나리오를 실패시킨다.
function element<T extends HTMLElement = HTMLElement>(selector: string): T { const node = container.querySelector<T>(selector); if (!node) throw new Error(`Missing: ${selector}`); return node; }
// 기능 : 실제 앱 경로와 이력을 변경한다.
async function navigate(path: string) { await act(async () => router.navigate(path)); }
// 기능 : 실제 버튼과 링크의 클릭을 실행한다.
async function click(selector: string) { await act(async () => element(selector).click()); }
// 기능 : 반응형 경계 변경 이벤트를 전달하며 실제 화면 크기 검증과 구분한다.
async function resize(value: boolean) { await act(async () => { wide = value; [...listeners].forEach(listener => listener()); }); }
// 기능 : 셸의 복구와 탐색 초점이 실제 라우터 전환 뒤에도 유지되는지 검증한다.
describe("G14 app shell and recovery", () => {
  // 기능 : 축소 시 접근 이름을 유지하고 펼침 및 경로 이동 뒤에도 같은 메뉴 상태를 보존한다.
  it("preserves collapse state and focus across workspace navigation", async () => {
    await click('[aria-label="Collapse sidebar"]');
    expect(document.activeElement).toBe(element('[aria-label="Expand sidebar"]'));
    expect(element('nav[aria-label="Workspace navigation"] a[aria-label="Clients"]').title).toBe("Clients");
    await click('.app-sidebar-desktop a[aria-label="Clients"]');
    expect(location.pathname).toBe("/app/clients"); expect(element(".app-shell").classList.contains("has-collapsed-sidebar")).toBe(true);
    await click('[aria-label="Expand sidebar"]'); expect(document.activeElement).toBe(element('[aria-label="Collapse sidebar"]'));
  });
  // 기능 : 폭 변경으로 숨겨지는 메뉴의 초점을 보이는 제어로 옮기고 닫힌 모달의 스크롤 잠금을 해제한다.
  it("moves focus out of hidden navigation in both width directions", async () => {
    element('.app-sidebar-desktop a[aria-label="Clients"]').focus(); await resize(false);
    expect(document.activeElement).toBe(element(".app-mobile-toggle"));
    await resize(true); expect(document.activeElement).toBe(element('[aria-label="Collapse sidebar"]'));
    await resize(false); await click(".app-mobile-toggle"); expect(element<HTMLDialogElement>("dialog").open).toBe(true);
    await resize(true); expect(container.querySelector("dialog")).toBeNull();
    expect(document.activeElement).toBe(element('[aria-label="Collapse sidebar"]')); expect(document.body.style.overflow).not.toBe("hidden");
  });
  // 기능 : 모바일 메뉴의 취소는 호출 버튼으로 복귀하고 실제 이동은 새 화면 본문으로 초점을 넘긴다.
  it("distinguishes mobile cancellation from navigation", async () => {
    await resize(false); element(".app-mobile-toggle").focus(); await click(".app-mobile-toggle");
    await click('dialog [aria-label="Close dialog"]'); expect(document.activeElement).toBe(element(".app-mobile-toggle"));
    await click(".app-mobile-toggle"); await click('dialog a[aria-label="Clients"]');
    expect(container.querySelector("dialog")).toBeNull(); expect(location.pathname).toBe("/app/clients");
    expect(document.activeElement).toBe(element("#main-content"));
  });
  // 기능 : 내부 오류와 공개 오류의 화면·복구 목적지를 분리하고 이전 셸 상태가 공개 화면에 남지 않게 한다.
  it("recovers internal and public invalid URLs with separate destinations", async () => {
    await navigate("/app/unknown-g14"); expect(container.querySelector(".app-shell")).toBeNull();
    expect(element(".app-not-found a").getAttribute("href")).toBe("/app"); await click(".app-not-found a");
    expect(element(".app-shell")).toBeTruthy();
    await navigate("/unknown-g14"); expect(container.querySelector(".app-shell")).toBeNull();
    expect(element('.public-not-found a[href="/"]').textContent).toBe("GO TO HOMEPAGE");
    await click('.public-not-found a[href="/support"]'); expect(location.pathname).toBe("/support");
  });
});

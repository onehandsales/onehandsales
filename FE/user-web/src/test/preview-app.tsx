import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, vi } from "vitest";
import { App } from "@/app/app";
import { router } from "@/app/router/router";

// 기능 : 설정·초대 연결 테스트에서 실제 앱과 저장소를 사용하고 브라우저 미지원 기능만 대체한다.
export function setupPreviewApp(startPath: string) {
  let container: HTMLDivElement; let root: Root;
  const originalShow = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, "showModal");
  const originalClose = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, "close");
  // 기능 : 지정한 필수 요소가 없으면 시나리오를 실패시킨다.
  function element<T extends HTMLElement = HTMLElement>(selector: string): T { const node = container.querySelector<T>(selector); if (!node) throw new Error(`Missing: ${selector}`); return node; }
  // 기능 : 실제 라우터에서 경로·query·hash와 새 이력 항목을 적용한다.
  async function navigate(path: string) { await act(async () => router.navigate(path)); }
  // 기능 : 실제 버튼이나 링크를 클릭한다.
  async function click(selector: string) { await act(async () => element(selector).click()); }
  // 기능 : 선택 제어의 change 이벤트를 전달한다.
  async function choose(selector: string, value: string) { await act(async () => { const node = element<HTMLSelectElement>(selector); node.value = value; node.dispatchEvent(new Event("change", { bubbles: true })); }); }
  // 기능 : React 제어 입력에 네이티브 값과 input 이벤트를 전달한다.
  async function input(selector: string, value: string) { await act(async () => { const node = element<HTMLInputElement>(selector); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(node, value); node.dispatchEvent(new Event("input", { bubbles: true })); }); }
  // 기능 : 실제 목 지연과 React 완료 렌더를 기다린다.
  async function settle(ms = 400) { await act(async () => { await new Promise(resolve => setTimeout(resolve, ms)); }); }
  // 기능 : 각 테스트에 새 공급자를 만들고 명시적인 로컬 소유자 문맥으로 진입한다.
  beforeEach(async () => {
    vi.stubGlobal("matchMedia", (query: string) => ({ matches: true, media: query, addEventListener() {}, removeEventListener() {} }));
    vi.stubGlobal("scrollTo", () => {});
    vi.stubGlobal("IntersectionObserver", class { observe() {} disconnect() {} unobserve() {} });
    // 기능 : 모달의 open 속성만 대체하며 네이티브 초점 잠금 검증으로 간주하지 않는다.
    Object.defineProperty(HTMLDialogElement.prototype, "showModal", { configurable: true, value: function showModal(this: HTMLDialogElement) { this.open = true; } });
    // 기능 : 모달 닫기 속성을 동기화한다.
    Object.defineProperty(HTMLDialogElement.prototype, "close", { configurable: true, value: function close(this: HTMLDialogElement) { this.open = false; } });
    container = document.createElement("div"); document.body.append(container); root = createRoot(container);
    await router.navigate("/components", { replace: true }); await act(async () => root.render(<App />));
    await choose(".preview-tools label:first-of-type select", "preview-a"); await navigate(startPath); await settle();
  });
  // 기능 : 지연 작업과 공급자·브라우저 대체를 해제하여 다음 실행에 상태가 남지 않게 한다.
  afterEach(async () => {
    await act(async () => root.unmount()); container.remove(); vi.restoreAllMocks(); vi.unstubAllGlobals();
    if (originalShow) Object.defineProperty(HTMLDialogElement.prototype, "showModal", originalShow); else Reflect.deleteProperty(HTMLDialogElement.prototype, "showModal");
    if (originalClose) Object.defineProperty(HTMLDialogElement.prototype, "close", originalClose); else Reflect.deleteProperty(HTMLDialogElement.prototype, "close");
  });
  return { element, navigate, click, choose, input, settle };
}

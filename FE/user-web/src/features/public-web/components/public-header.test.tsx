import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PublicHeader } from "./public-header";
import { PublicProvider } from "./public-provider";

let container: HTMLDivElement;
let root: Root;
let desktop: boolean;
let layoutListeners: Set<() => void>;

// 기능 : 실제 공개 헤더를 jsdom에 연결하고 화면 폭의 환경 신호만 대체한다.
beforeEach(async () => {
  desktop = true;
  layoutListeners = new Set();
  vi.stubGlobal("matchMedia", (query: string) => ({
    get matches() { return desktop; }, media: query,
    addEventListener: (_type: string, listener: () => void) => layoutListeners.add(listener),
    removeEventListener: (_type: string, listener: () => void) => layoutListeners.delete(listener),
  }));
  window.history.replaceState(null, "", "/");
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root.render(<BrowserRouter><PublicProvider resetRevision={0}>
    <PublicHeader scrolled={false} /><button data-outside>Outside</button>
  </PublicProvider></BrowserRouter>));
});

// 기능 : 헤더의 전역 리스너와 대체한 환경을 각 검증 뒤 정리한다.
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

// 기능 : 필수 요소의 누락을 즉시 실패로 판정한다.
function element<T extends HTMLElement = HTMLElement>(selector: string): T {
  const value = container.querySelector<T>(selector);
  if (!value) throw new Error(`Missing element: ${selector}`);
  return value;
}

// 기능 : 공개 탐색의 이름으로 메뉴 트리거를 찾는다.
function trigger(name: string) {
  const value = [...container.querySelectorAll<HTMLButtonElement>("#public-navigation button")].find(button => button.textContent === name);
  if (!value) throw new Error(`Missing trigger: ${name}`);
  return value;
}

// 기능 : React의 포인터 진입·이탈을 파일 산출물 없이 합성한다.
async function pointer(target: HTMLElement, type: "pointerover" | "pointerout", pointerType = "mouse") {
  const event = new MouseEvent(type, { bubbles: true, relatedTarget: document.body });
  Object.defineProperty(event, "pointerType", { value: pointerType });
  await act(async () => target.dispatchEvent(event));
}

// 기능 : 실제 DOM 초점을 이동해 공개 헤더의 focus·blur 처리를 실행한다.
async function focus(target: HTMLElement) { await act(async () => target.focus()); }

// 기능 : 키보드 이벤트로 메뉴 닫기와 템플릿 선택을 실행한다.
async function key(target: HTMLElement, value: string) {
  await act(async () => target.dispatchEvent(new KeyboardEvent("keydown", { key: value, bubbles: true, cancelable: true })));
}

describe("public menu focus across pointer and keyboard input", () => {
  it("keeps a focused menu link mounted when the pointer leaves, then closes on outside focus", async () => {
    await pointer(trigger("Product"), "pointerover");
    const crm = element<HTMLAnchorElement>('#public-mega-menu a[href="/crm"]');
    await focus(crm);
    await pointer(element("header"), "pointerout");
    expect(document.activeElement).toBe(crm);
    expect(crm.isConnected).toBe(true);
    expect(trigger("Product").getAttribute("aria-expanded")).toBe("true");
    await focus(element("[data-outside]"));
    expect(container.querySelector("#public-mega-menu")).toBeNull();
  });

  it("does not remove a focused panel on incidental hover over another menu", async () => {
    await pointer(trigger("Product"), "pointerover");
    const crm = element<HTMLAnchorElement>('#public-mega-menu a[href="/crm"]');
    await focus(crm);
    await pointer(trigger("Industries"), "pointerover");
    expect(document.activeElement).toBe(crm);
    expect(crm.isConnected).toBe(true);
    await act(async () => trigger("Industries").click());
    expect(trigger("Industries").getAttribute("aria-expanded")).toBe("true");
  });

  it("keeps the keyboard-selected template and focused link on incidental category hover", async () => {
    await pointer(trigger("Templates"), "pointerover");
    await focus(element("#template-tab-0"));
    await key(element("#template-tab-0"), "ArrowDown");
    const selected = element("#template-tab-1");
    await pointer(element("#template-tab-2"), "pointerover");
    expect(selected.getAttribute("aria-selected")).toBe("true");
    expect(document.activeElement).toBe(selected);
    const link = element<HTMLAnchorElement>("#template-panel a");
    await focus(link);
    await pointer(element("#template-tab-2"), "pointerover");
    expect(document.activeElement).toBe(link);
    expect(link.isConnected).toBe(true);
    await act(async () => element("#template-tab-2").click());
    expect(element("#template-tab-2").getAttribute("aria-selected")).toBe("true");
  });

  it("still switches mouse-only menus and categories and closes on pointer exit", async () => {
    await pointer(trigger("Product"), "pointerover");
    await pointer(trigger("Resources"), "pointerover");
    expect(element<HTMLAnchorElement>('#public-mega-menu a[href="/blog"]').href).toContain("/blog");
    await pointer(trigger("Templates"), "pointerover");
    await pointer(element("#template-tab-2"), "pointerover");
    expect(element("#template-tab-2").getAttribute("aria-selected")).toBe("true");
    await pointer(element("header"), "pointerout");
    expect(container.querySelector("#public-mega-menu")).toBeNull();
  });

  it("returns focus to the trigger on Escape and keeps outside-pointer focus intact", async () => {
    await pointer(trigger("Product"), "pointerover");
    await focus(element('#public-mega-menu a[href="/crm"]'));
    await key(document.activeElement as HTMLElement, "Escape");
    expect(document.activeElement).toBe(trigger("Product"));
    expect(container.querySelector("#public-mega-menu")).toBeNull();
    await act(async () => trigger("Product").click());
    await focus(element("[data-outside]"));
    await act(async () => element("[data-outside]").dispatchEvent(new MouseEvent("pointerdown", { bubbles: true })));
    expect(document.activeElement).toBe(element("[data-outside]"));
    expect(container.querySelector("#public-mega-menu")).toBeNull();
  });

  it("ignores touch hover and restores focus when desktop navigation becomes mobile", async () => {
    await pointer(trigger("Product"), "pointerover", "touch");
    expect(container.querySelector("#public-mega-menu")).toBeNull();
    await pointer(trigger("Product"), "pointerover");
    await focus(element('#public-mega-menu a[href="/crm"]'));
    await act(async () => { desktop = false; layoutListeners.forEach(listener => listener()); });
    const toggle = element<HTMLButtonElement>(".public-mobile-toggle");
    expect(document.activeElement).toBe(toggle);
    expect(container.querySelector("#public-mega-menu")).toBeNull();
    await act(async () => toggle.click());
    await act(async () => trigger("Templates").click());
    await act(async () => toggle.click());
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(container.querySelector("#public-mega-menu")).toBeNull();
  });
});

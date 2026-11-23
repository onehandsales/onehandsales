import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { matchRoutes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "../app";
import { router } from "./router";
import { publicDestinations } from "@/features/public-web";

let container: HTMLDivElement;
let root: Root;

// 기능 : 실제 앱 공급자와 라우터를 연결하고 jsdom에 없는 화면 측정만 대체한다.
beforeEach(async () => {
  vi.stubGlobal("matchMedia", (query: string) => ({ matches: query === "(min-width: 992px)", media: query, addEventListener() {}, removeEventListener() {} }));
  vi.stubGlobal("scrollTo", () => {});
  container = document.createElement("div"); document.body.append(container); root = createRoot(container);
  await router.navigate("/", { replace: true });
  await act(async () => root.render(<App />));
});

// 기능 : 실제 공급자의 메모리와 환경 대체를 검증마다 폐기한다.
afterEach(async () => { await act(async () => root.unmount()); container.remove(); vi.unstubAllGlobals(); });

// 기능 : 실제 렌더링된 필수 요소를 찾고 누락을 실패로 판정한다.
function element<T extends HTMLElement = HTMLElement>(selector: string): T {
  const target = container.querySelector<T>(selector);
  if (!target) throw new Error(`Missing element: ${selector}`);
  return target;
}

// 기능 : 브라우저 이력을 대체하지 않고 실제 라우터의 URL 이동을 실행한다.
async function navigate(path: string) { await act(async () => router.navigate(path)); }

// 기능 : 실제 DOM 클릭으로 링크·버튼 핸들러와 navigation을 실행한다.
async function click(selector: string) { await act(async () => element(selector).click()); }

// 기능 : 네이티브 값 변경과 입력 이벤트로 제어 입력을 갱신한다.
async function input(selector: string, value: string) {
  const target = element<HTMLInputElement>(selector);
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(target, value);
    target.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

// 기능 : 실제 history의 뒤로·앞으로 완료까지 기다린다.
async function traverse(direction: "back" | "forward") {
  await act(async () => {
    const changed = new Promise<void>(resolve => window.addEventListener("popstate", () => resolve(), { once: true }));
    window.history[direction](); await changed;
  });
}

describe("public entry and auth handoff through the application router", () => {
  it("resolves every registered public destination without falling into the global 404", () => {
    for (const destination of publicDestinations) {
      const matches = matchRoutes(router.routes, destination.path);
      expect(matches?.at(-1)?.route.path, destination.path).not.toBe("*");
      expect(matches?.length, destination.path).toBeGreaterThan(0);
    }
  });

  it("retains the focused menu on public consumers and navigates CRM with real history", async () => {
    for (const path of ["/", "/crm", "/software/consulting", "/software/small-businesses", "/pricing", "/reviews",
      "/blog", "/templates", "/invoice-template", "/invoice-generator", "/support", "/affiliates", "/careers",
      "/legal/privacy", "/legal/terms", "/outbound/linkedin", "/scheduling"]) {
      await navigate(path);
      const trigger = element<HTMLButtonElement>("#public-navigation button");
      const enter = new MouseEvent("pointerover", { bubbles: true }); Object.defineProperty(enter, "pointerType", { value: "mouse" });
      await act(async () => trigger.dispatchEvent(enter));
      const link = element<HTMLAnchorElement>('#public-mega-menu a[href="/crm"]');
      await act(async () => link.focus());
      await act(async () => element(".public-header").dispatchEvent(new MouseEvent("pointerout", { bubbles: true, relatedTarget: document.body })));
      expect(document.activeElement, path).toBe(link);
      expect(link.isConnected, path).toBe(true);
    }
    await navigate("/");
    await click("#public-navigation button");
    await click('#public-mega-menu a[href="/crm"]');
    expect(window.location.pathname).toBe("/crm");
    expect(container.querySelector("#public-mega-menu")).toBeNull();
    await traverse("back"); expect(window.location.pathname).toBe("/");
    await traverse("forward"); expect(window.location.pathname).toBe("/crm");
  });

  it("validates an email, guards composition and duplicates, and preserves the selected intent across signup/login/history", async () => {
    const field = ".public-signup-form input";
    await input(field, "긴한국어입력".repeat(20));
    await click(".public-signup-form button");
    expect(element('[role="alert"]').textContent).toContain("valid email");
    expect(element<HTMLInputElement>(field).value).toBe("긴한국어입력".repeat(20));
    await input(field, "landing@example.test");
    await act(async () => element(field).dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true })));
    await click(".public-signup-form button"); expect(window.location.pathname).toBe("/");
    await act(async () => element(field).dispatchEvent(new CompositionEvent("compositionend", { bubbles: true })));
    const length = window.history.length;
    await act(async () => { const form = element<HTMLFormElement>(".public-signup-form"); form.requestSubmit(); form.requestSubmit(); });
    expect(window.history.length).toBe(length + 1);
    expect(element<HTMLInputElement>("#signup-email").value).toBe("landing@example.test");
    const intentId = router.state.location.state.publicIntentId;
    expect(Object.keys(router.state.location.state)).toEqual(["publicIntentId"]);
    expect(JSON.stringify(window.history.state)).not.toContain("landing@example.test");
    await click('.auth-header a[href="/login"]');
    expect(element<HTMLInputElement>("#login-email").value).toBe("landing@example.test");
    expect(router.state.location.state.publicIntentId).toBe(intentId);
    await click('.auth-header a[href="/signup"]');
    expect(element<HTMLInputElement>("#signup-email").value).toBe("landing@example.test");
    await traverse("back"); await traverse("back"); await traverse("back");
    expect(window.location.pathname).toBe("/");
    expect(element<HTMLInputElement>(field).value).toBe("landing@example.test");
    await traverse("forward");
    expect(element<HTMLInputElement>("#signup-email").value).toBe("landing@example.test");
    await click(".auth-below > .auth-secondary");
    expect(window.location.pathname).toBe("/");
    expect(element<HTMLInputElement>(field).value).toBe("");
  });

  // 기능 : 현재 목적지 재선택에서도 데스크톱·모바일 메뉴 종료와 본문 초점 인계를 검증한다.
  it.each([false, true])("closes the menu and focuses content when selecting the current page (mobile: %s)", async mobile => {
    if (mobile) vi.stubGlobal("matchMedia", (query: string) => ({ matches: false, media: query, addEventListener() {}, removeEventListener() {} }));
    await navigate("/crm");
    if (mobile) await click(".public-mobile-toggle");
    await click("#public-navigation button");
    const link = element<HTMLAnchorElement>('#public-mega-menu a[href="/crm"]');
    await act(async () => link.focus());
    const previousKey = router.state.location.key;
    await click('#public-mega-menu a[href="/crm"]');
    expect(window.location.pathname).toBe("/crm");
    expect(router.state.location.key).not.toBe(previousKey);
    expect(container.querySelector("#public-mega-menu")).toBeNull();
    expect(element(".public-mobile-toggle").getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(element("#main-content"));
  });

  it("keeps other pathname drafts when cancelling an older signup intent", async () => {
    await input(".public-signup-form input", "landing@example.test");
    await click(".public-signup-form button");
    await navigate("/software/consulting");
    await input(".public-signup-form input", "consulting@example.test");
    await click(".public-signup-form button");
    await traverse("back"); await traverse("back");
    expect(element<HTMLInputElement>("#signup-email").value).toBe("landing@example.test");
    await click(".auth-below > .auth-secondary");
    expect(element<HTMLInputElement>(".public-signup-form input").value).toBe("");
    await navigate("/software/consulting");
    expect(element<HTMLInputElement>(".public-signup-form input").value).toBe("consulting@example.test");
  });

  it("keeps the link CTA duplicate guard and leaves email out of a non-email intent", async () => {
    await input(".public-signup-form input", "unused@example.test");
    const length = window.history.length;
    await act(async () => { const link = element('.public-auth-links a[href="/signup"]'); link.click(); link.click(); });
    expect(window.history.length).toBe(length + 1);
    expect(element<HTMLInputElement>("#signup-email").value).toBe("");
    await traverse("back");
    expect(element<HTMLInputElement>(".public-signup-form input").value).toBe("unused@example.test");
  });

  it("keeps promotional mockups static, synchronizes manual selections and opens local footer destinations", async () => {
    expect(container.querySelector(".public-overview input, .public-overview button, .public-support-art input")).toBeNull();
    expect(element('.public-testimonial-controls [aria-pressed="true"]').textContent).toContain("03");
    expect(element(".public-testimonial-copy").textContent).toContain("Alexandre");
    await click(".public-testimonial-controls button:first-child");
    expect(element('.public-testimonial-controls [aria-pressed="true"]').textContent).toContain("01");
    expect(element(".public-testimonial-copy").textContent).toContain("Alison");
    expect(element<HTMLImageElement>(".public-testimonial-photo").alt).toContain("Alison");
    await click(".public-finance-options article:nth-child(2) button");
    expect(element('.public-finance-options [aria-pressed="true"]').textContent).toBe("Banking");
    expect(element(".public-finance-art").getAttribute("aria-label")).toContain("Banking");
    await click(".public-experience-options button:first-child");
    expect(element('.public-experience-options [aria-pressed="true"]').textContent).toContain("Client CRM");
    expect(element<HTMLImageElement>(".public-experience-art .is-current").alt).toContain("Client CRM");
    expect(container.querySelectorAll(".public-footer-grid > div")).toHaveLength(5);
    expect(container.querySelectorAll(".public-footer details")).toHaveLength(9);
    await click(".public-footer summary");
    expect(element<HTMLDetailsElement>(".public-footer details").open).toBe(true);
    await click('.public-footer a[href="/legal/privacy"]');
    expect(window.location.pathname).toBe("/legal/privacy");
    await traverse("back"); expect(window.location.pathname).toBe("/");
    await click('.public-footer a[href="/outbound/linkedin"]');
    expect(window.location.pathname).toBe("/outbound/linkedin");
    expect(router.state.location.state.companyOrigin).toBe("/");
  });
});

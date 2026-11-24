import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "../app";
import { router } from "./router";

let container: HTMLDivElement;
let root: Root;
const article = "/help/articles/4409019";
const searchField = '.help-search input';
const scrollDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollIntoView");
const dialogMethods = ["showModal", "close"] as const;
const dialogDescriptors = dialogMethods.map(name => Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, name));

// 기능 : 실제 앱과 라우터를 사용하고 jsdom이 제공하지 않는 화면 측정만 대체한다.
beforeEach(async () => {
  vi.stubGlobal("matchMedia", (query: string) => ({ matches: query === "(min-width: 992px)", media: query, addEventListener() {}, removeEventListener() {} }));
  vi.stubGlobal("scrollTo", () => {});
  vi.stubGlobal("IntersectionObserver", class { observe() {} disconnect() {} unobserve() {} });
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value() {} });
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", { configurable: true, value(this: HTMLDialogElement) { this.open = true; } });
  Object.defineProperty(HTMLDialogElement.prototype, "close", { configurable: true, value(this: HTMLDialogElement) { this.open = false; } });
  container = document.createElement("div"); document.body.append(container); root = createRoot(container);
  await router.navigate("/help", { replace: true });
  await act(async () => root.render(<App />));
  await settle();
});

// 기능 : 목 공급자와 타이머 수명을 종료하고 화면 기능 대체를 복원한다.
afterEach(async () => {
  await act(async () => root.unmount()); container.remove(); vi.unstubAllGlobals(); vi.restoreAllMocks();
  if (scrollDescriptor) Object.defineProperty(HTMLElement.prototype, "scrollIntoView", scrollDescriptor);
  else Reflect.deleteProperty(HTMLElement.prototype, "scrollIntoView");
  // 기능 : 미지원 네이티브 모달 메서드를 원래 descriptor로 복원한다.
  dialogMethods.forEach(function restoreDialog(name, index) {
    const descriptor = dialogDescriptors[index];
    if (descriptor) Object.defineProperty(HTMLDialogElement.prototype, name, descriptor);
    else Reflect.deleteProperty(HTMLDialogElement.prototype, name);
  });
});

// 기능 : 필수 DOM 누락을 명확한 검증 실패로 처리한다.
function element<T extends HTMLElement = HTMLElement>(selector: string): T {
  const target = container.querySelector<T>(selector);
  if (!target) throw new Error(`Missing element: ${selector}`);
  return target;
}
// 기능 : 로컬 지연과 React 반영이 끝날 때까지 기다린다.
async function settle(ms = 130) { await act(async () => { await new Promise(resolve => setTimeout(resolve, ms)); }); }
// 기능 : 실제 라우터에서 URL과 진입 상태를 함께 전달한다.
async function navigate(path: string, state?: unknown) { await act(async () => router.navigate(path, { state })); }
// 기능 : 실제 링크·버튼의 DOM 클릭 이벤트를 전달한다.
async function click(selector: string) { await act(async () => element(selector).click()); }
// 기능 : 제어 입력의 네이티브 값 변경을 전달한다.
async function input(value: string) {
  await act(async () => {
    const target = element<HTMLInputElement>(searchField);
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(target, value);
    target.dispatchEvent(new Event("input", { bubbles: true }));
  });
}
// 기능 : 실제 history의 POP을 기다려 뒤로·앞으로 복귀를 검증한다.
async function traverse(direction: "back" | "forward") {
  await act(async () => {
    const popped = new Promise<void>(resolve => window.addEventListener("popstate", () => resolve(), { once: true }));
    window.history[direction](); await popped;
  });
}
// 기능 : 경로·검색·문서 위치를 하나의 복귀 결과로 비교한다.
function currentUrl() { return location.pathname + location.search + location.hash; }
// 기능 : 기존 목 도구로 시나리오를 선택한 뒤 지정한 공개 화면으로 돌아간다.
async function scenario(value: string, path = "/help") {
  await navigate("/components"); await select(".preview-tools label:last-of-type select", value); await navigate(path);
}
// 기능 : 실제 선택 필드에서 언어와 목 시나리오를 변경한다.
async function select(selector: string, value: string) {
  await act(async () => {
    const target = element<HTMLSelectElement>(selector); target.value = value;
    target.dispatchEvent(new Event("change", { bubbles: true }));
  });
}
// 기능 : 명시적 검색 제출을 반복하여 중복 이력과 입력 보존을 검증한다.
async function submit(times = 1) {
  await act(async () => {
    for (let index = 0; index < times; index++) element(".help-search").dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  });
}

// 기능 : 도움말 탐색·문의·피드백과 직접 연결된 인증 경계의 회귀를 검증한다.
describe("G08 help, article and support journeys", () => {
  // 기능 : 공개 메뉴·푸터·문의 카드가 같은 도움말 경로로 연결되고 실제 이력으로 복귀하는지 확인한다.
  it("connects Resources, public footer and the support help card", async () => {
    const origin = "/support?entry=navigation#channels"; await navigate(origin);
    await click("#public-navigation button:nth-of-type(4)");
    await click('#public-mega-menu a[href="/help"]'); await settle();
    expect(location.pathname).toBe("/help"); expect(container.querySelector("#public-mega-menu")).toBeNull();
    await traverse("back"); expect(currentUrl()).toBe(origin);
    await click('.support-channels a[href="/help"]'); await settle(); expect(location.pathname).toBe("/help");
    await click('.help-topbar a[href="/"]'); await click('.public-footer a[href="/support"]');
    expect(location.pathname).toBe("/support");
  });

  // 기능 : 두 영어 복귀 경로가 검색·문서 위치·상위 복귀 상태를 동일하게 보존하는지 확인한다.
  it("preserves search, hash and return state through both English controls", async () => {
    const state = { helpOrigin: "/help?q=portal#results" };
    await navigate("/help/collections/96965?q=portal&lang=ko#results", state);
    await click('.help-index section a'); await settle();
    expect(currentUrl()).toBe("/help/collections/96965?q=portal#results");
    expect(router.state.location.state).toEqual(state);
    await navigate(article + "?entry=language&lang=ko#portal-branding", state);
    await select('select[aria-label="Help language"]', "en");
    expect(currentUrl()).toBe(article + "?entry=language#portal-branding");
    expect(element<HTMLAnchorElement>(".help-back").getAttribute("href")).toBe(state.helpOrigin);
  });

  // 기능 : 문의 FAQ에서 목차와 관련 기사를 거쳐도 전체 문의 URL로 돌아가는지 확인한다.
  it("keeps the support origin and article query through TOC and related articles", async () => {
    const origin = "/support?entry=faq#questions"; await navigate(origin);
    expect(container.querySelectorAll(".support-faq li")).toHaveLength(10);
    await click(`.support-faq a[href="${article}"]`);
    await navigate(article + "?entry=faq&lang=en", router.state.location.state);
    const length = window.history.length;
    await click('.help-toc a[href$="#portal-branding"]');
    expect(currentUrl()).toBe(article + "?entry=faq&lang=en#portal-branding");
    expect(window.history.length).toBe(length);
    await click(".help-related a"); expect(element(".help-missing").textContent).toContain("Article body not provided");
    await click(".help-back"); expect(currentUrl()).toBe(article + "?entry=faq&lang=en#portal-branding");
    await click(".help-back"); expect(currentUrl()).toBe(origin);
  });

  // 기능 : 검색 결과와 홈 인기 기사의 복귀가 출발 hash를 보존하는지 확인한다.
  it("returns to complete search and popular origins", async () => {
    for (const [url, selector] of [["/help?q=portal#results", ".help-result-list a"], ["/help?entry=popular#top", ".help-popular a"]] as const) {
      await navigate(url); await settle(); await click(selector);
      await click(".help-back"); expect(currentUrl()).toBe(url);
      await traverse("back"); expect(location.pathname).toBe(article);
      await traverse("forward"); expect(currentUrl()).toBe(url);
    }
  });

  // 기능 : 같은 경로의 새 이력과 POP에서 안내가 닫히고 네이티브 취소가 호출자 초점을 복원하는지 확인한다.
  it("closes dialogs on history changes and restores focus on native cancel", async () => {
    for (const [path, trigger] of [[article, ".help-video-poster"], ["/support", ".support-channels article:first-child button"]] as const) {
      await navigate(path); const opener = element(trigger); await act(async () => opener.focus()); await click(trigger);
      expect(document.querySelector('dialog')).not.toBeNull();
      await act(async () => element("dialog").dispatchEvent(new Event("cancel", { bubbles: true, cancelable: true })));
      expect(document.querySelector('dialog')).toBeNull(); expect(document.activeElement).toBe(opener);
      await click(trigger); await navigate(path + "?entry=next#position");
      expect(document.querySelector('dialog')).toBeNull();
      await click(trigger); await traverse("back"); expect(document.querySelector('dialog')).toBeNull();
    }
  });

  // 기능 : IME 조합과 종료 직후 Enter를 막고 명시적 검색·뒤로 복귀만 URL에 반영하는지 확인한다.
  it("guards IME completion, keeps drafts and avoids duplicate search history", async () => {
    const target = element(searchField);
    await act(async () => target.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true })));
    await input("긴 한국어 입력 ".repeat(20)); await submit(); expect(location.search).toBe("");
    await act(async () => target.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true })));
    const enter = new KeyboardEvent("keydown", { key: "Enter", keyCode: 229, bubbles: true, cancelable: true });
    await act(async () => target.dispatchEvent(enter)); expect(enter.defaultPrevented).toBe(true);
    await input(" portal "); await submit(); await settle();
    expect(element<HTMLInputElement>(searchField).value).toBe("portal"); const length = window.history.length;
    await submit(2); expect(window.history.length).toBe(length);
    await input("unsent draft"); expect(location.search).toBe("?q=portal");
    await traverse("back"); expect(element<HTMLInputElement>(searchField).value).toBe("");
    await traverse("forward"); expect(element<HTMLInputElement>(searchField).value).toBe("portal");
  });

  // 기능 : 느린 이전 조회가 최신 검색·미제출 초안과 무결과 상태를 덮지 않는지 확인한다.
  it("isolates slow search results from newer queries and unsent edits", async () => {
    await scenario("slow"); await input("portal"); await submit();
    await input("unmatched-g08"); await submit(); await input("new unsent draft");
    await settle(1600);
    expect(location.search).toBe("?q=unmatched-g08");
    expect(element<HTMLInputElement>(searchField).value).toBe("new unsent draft");
    expect(element('.help-index [role="status"]').textContent).toBe("No articles match this search.");
    await scenario("normal");
  });

  // 기능 : 읽기 실패 재시도·빈 자료·잘못된 분류와 기사 ID를 서로 다른 상태로 유지하는지 확인한다.
  it("separates retry, empty data, unknown collections and missing articles", async () => {
    const url = "/help/collections/96965?q=portal#results";
    await scenario("read-error", url); await settle(); expect(element('.help-index [role="alert"]').textContent).toContain("Help could not be loaded");
    await click('.help-index [role="alert"] button'); await settle();
    expect(currentUrl()).toBe(url); expect(container.querySelectorAll(".help-result-list a")).toHaveLength(1);
    await scenario("empty"); await settle(); expect(element(".help-index").textContent).toContain("No help articles available");
    await scenario("normal", "/help/collections/unknown"); await settle(); expect(element(".help-index h1").textContent).toBe("Collection not included");
    await navigate("/help/articles/not-included"); expect(element(".help-index h1").textContent).toBe("Article not found");
  });

  // 기능 : 실패한 평가를 보존하고 재시도한 저장값을 같은 기사 별칭과 관련 기사 왕복에서 공유하는지 확인한다.
  it("retries feedback without losing its choice and shares canonical article IDs", async () => {
    await scenario("write-error", article); await click('.help-feedback button[aria-label="Helpful"]'); await settle();
    expect(element('.help-feedback [role="alert"]').textContent).toContain("could not be saved");
    expect(element('.help-feedback button[aria-label="Helpful"]').getAttribute("aria-pressed")).toBe("true");
    await click('.help-feedback [role="alert"] button'); await settle();
    expect(element('.help-feedback [role="status"]').textContent).toContain("saved in this local preview");
    await click(".help-related a"); await click(".help-back");
    await navigate(article + "-how-can-i-use-my-client-portal");
    expect(element('.help-feedback button[aria-label="Helpful"]').getAttribute("aria-pressed")).toBe("true");
    await navigate("/components"); await click(".preview-tools button"); await navigate(article);
    expect(container.querySelector('.help-feedback button[aria-pressed="true"]')).toBeNull();
  });

  // 기능 : 빠른 평가 재선택·중복·취소와 기사 이탈이 잘못된 저장을 만들지 않는지 확인한다.
  it("saves only the last feedback and cancels pending work on cancel or article exit", async () => {
    await scenario("slow", article);
    await click('.help-feedback button[aria-label="Helpful"]'); await click('.help-feedback button[aria-label="Helpful"]');
    await click('.help-feedback button[aria-label="Not helpful"]'); await settle(1600);
    expect(element('.help-feedback button[aria-label="Not helpful"]').getAttribute("aria-pressed")).toBe("true");
    await click('.help-feedback button[aria-label="Somewhat helpful"]'); await click('.help-feedback [role="status"] button'); await settle(1600);
    expect(element('.help-feedback button[aria-label="Not helpful"]').getAttribute("aria-pressed")).toBe("true");
    await click('.help-feedback button[aria-label="Helpful"]'); await click(".help-related a"); await settle(1600); await click(".help-back");
    expect(element('.help-feedback button[aria-label="Not helpful"]').getAttribute("aria-pressed")).toBe("true");
    await navigate("/support"); await navigate(article);
    expect(container.querySelector('.help-feedback button[aria-pressed="true"]')).toBeNull(); await scenario("normal");
  }, 10000);

  // 기능 : 영상·브랜드·지원 안내가 실제 제어·전송으로 바뀌지 않고 헤더·푸터 모달도 이력에서 닫히는지 확인한다.
  it("keeps video, branding, email and feature requests as explicit local references", async () => {
    await navigate(article); expect(container.querySelectorAll(".help-branding-image")).toHaveLength(1);
    expect(container.querySelectorAll(".help-article-body input, .help-article-body iframe")).toHaveLength(0);
    await click(".help-inline-link"); expect(document.querySelector('dialog')?.textContent).toContain("belongs to G16");
    await click(".dialog__close"); await click(".help-topbar nav > button");
    expect(document.querySelector('dialog')?.textContent).toContain("https://bonsai.cnflx.io/");
    await navigate(article + "?entry=footer"); expect(document.querySelector('dialog')).toBeNull();
    await click(".help-footer nav button"); expect(document.querySelector('dialog')?.textContent).toContain("mailto:support@hellobonsai.com");
    await traverse("back"); expect(document.querySelector('dialog')).toBeNull();
    expect([...container.querySelectorAll<HTMLAnchorElement>('a')].filter(link => /^(https?:|mailto:)/.test(link.getAttribute("href") ?? ""))).toHaveLength(0);
  });

  // 기능 : 문의에서 미인증 앱 진입·뒤로 복귀·가상 로그인 후 앱 진입을 실제 라우터로 확인한다.
  it("connects support and My Account to local authentication and preserves browser return", async () => {
    const origin = "/support?entry=chat#channels"; await navigate(origin);
    await click(".support-channels article:nth-child(2) button"); await click('dialog a[href="/app"]');
    expect(currentUrl()).toBe("/login?returnTo=%2Fapp"); await traverse("back"); expect(currentUrl()).toBe(origin);
    await navigate("/help?entry=account#top"); await settle(); await click('.help-topbar a[href="/app"]');
    expect(location.pathname).toBe("/login"); await click(".auth-samples button:first-of-type"); await settle(750);
    expect(location.pathname).toBe("/app"); await traverse("back"); expect(currentUrl()).toBe("/help?entry=account#top");
    await click('.help-footer a[href="/app"]'); expect(location.pathname).toBe("/app");
  });

  // 기능 : 직접 기사 진입과 새 공급자 마운트에서 방문 메모리 평가를 복구하지 않는지 확인한다.
  it("starts direct entries safely and clears feedback after a fresh provider mount", async () => {
    await navigate(article + "?entry=direct#portal-questions"); expect(element<HTMLAnchorElement>(".help-back").getAttribute("href")).toBe("/help");
    await click('.help-feedback button[aria-label="Helpful"]'); await settle();
    await act(async () => root.unmount()); root = createRoot(container); await act(async () => root.render(<App />));
    expect(currentUrl()).toBe(article + "?entry=direct#portal-questions");
    expect(container.querySelector('.help-feedback button[aria-pressed="true"]')).toBeNull();
  });
});

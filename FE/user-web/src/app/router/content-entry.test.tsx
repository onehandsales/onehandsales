import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "../app";
import { router } from "./router";

let container: HTMLDivElement;
let root: Root;
const originalScroll = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollIntoView");
const dialogMethods = ["showModal", "close"] as const;
const originalDialog = dialogMethods.map(name => Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, name));
const articlePath = "/blog/how-to-start-a-digital-marketing-agency";

// 기능 : 실제 앱 공급자와 브라우저 라우터를 조립하고 jsdom의 미지원 레이아웃 기능만 대체한다.
beforeEach(async () => {
  vi.stubGlobal("matchMedia", (query: string) => ({ matches: query === "(min-width: 992px)", media: query, addEventListener() {}, removeEventListener() {} }));
  vi.stubGlobal("scrollTo", () => {});
  vi.stubGlobal("IntersectionObserver", class { observe() {} disconnect() {} unobserve() {} });
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value() {} });
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", { configurable: true, value(this: HTMLDialogElement) { this.open = true; } });
  Object.defineProperty(HTMLDialogElement.prototype, "close", { configurable: true, value(this: HTMLDialogElement) { this.open = false; } });
  container = document.createElement("div"); document.body.append(container); root = createRoot(container);
  await router.navigate("/blog", { replace: true });
  await act(async () => root.render(<App />));
  await settle(130);
});

// 기능 : 조회·타이머·공급자 수명을 종료하고 테스트가 변경한 DOM 기능을 복원한다.
afterEach(async () => {
  await act(async () => root.unmount()); container.remove(); vi.unstubAllGlobals(); vi.restoreAllMocks();
  if (originalScroll) Object.defineProperty(HTMLElement.prototype, "scrollIntoView", originalScroll);
  else Reflect.deleteProperty(HTMLElement.prototype, "scrollIntoView");
  // 기능 : 테스트가 대체한 네이티브 모달 메서드를 원래 descriptor로 복원한다.
  dialogMethods.forEach(function restoreDialog(name, index) {
    const descriptor = originalDialog[index];
    if (descriptor) Object.defineProperty(HTMLDialogElement.prototype, name, descriptor);
    else Reflect.deleteProperty(HTMLDialogElement.prototype, name);
  });
});

// 기능 : 필수 UI 누락을 즉시 실패로 판정한다.
function element<T extends HTMLElement = HTMLElement>(selector: string): T {
  const node = container.querySelector<T>(selector);
  if (!node) throw new Error(`Missing element: ${selector}`);
  return node;
}
// 기능 : 실제 로컬 지연과 React 갱신을 기다리며 navigation을 대체하지 않는다.
async function settle(ms = 240) { await act(async () => { await new Promise(resolve => setTimeout(resolve, ms)); }); }
// 기능 : 실제 링크나 버튼의 기본 클릭 경로를 실행한다.
async function click(selector: string) { await act(async () => element(selector).click()); }
// 기능 : 실제 앱 라우터로 독립 진입을 수행한다.
async function navigate(path: string) { await act(async () => router.navigate(path)); }
// 기능 : 실제 history의 비동기 POP까지 기다려 앞뒤 이동을 확인한다.
async function traverse(direction: "back" | "forward") {
  await act(async () => {
    const changed = new Promise<void>(resolve => window.addEventListener("popstate", () => resolve(), { once: true }));
    window.history[direction](); await changed;
  });
}
// 기능 : 실제 복귀 링크가 발생시키는 POP을 기다린다.
async function returnToOrigin() {
  await act(async () => {
    const changed = new Promise<void>(resolve => window.addEventListener("popstate", () => resolve(), { once: true }));
    element(".article-back").click(); await changed;
  });
}
// 기능 : 제어 입력에 네이티브 값과 입력 이벤트를 전달한다.
async function input(value: string, selector = ".blog-search") {
  const field = element<HTMLInputElement>(selector);
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(field, value);
    field.dispatchEvent(new Event("input", { bubbles: true }));
  });
}
// 기능 : OS IME가 아닌 합성 composition 이벤트를 입력에 전달한다.
async function composition(type: "compositionstart" | "compositionend") {
  await act(async () => element(".blog-search").dispatchEvent(new CompositionEvent(type, { bubbles: true })));
}
// 기능 : 현재 전체 공개 URL을 읽어 복귀 조건을 비교한다.
function currentUrl() { return window.location.pathname + window.location.search + window.location.hash; }
// 기능 : 검증 도구의 실제 select로 장애 시나리오를 바꾼다.
async function scenario(value: string) {
  await navigate("/components");
  await act(async () => {
    const field = element<HTMLSelectElement>(".preview-tools label:last-of-type select");
    field.value = value; field.dispatchEvent(new Event("change", { bubbles: true }));
  });
}

// 기능 : 검색 경합과 기사·가입·소개 연결의 실제 라우터 회귀를 검증한다.
describe("G05 content routes and connected handoffs", () => {
  // 기능 : 분류·검색·초기화·페이지 변경이 다른 URL 조건을 보존하는지 확인한다.
  it("keeps unrelated query and hash through category, search, clear and pages", async () => {
    await navigate("/blog?entry=footer#articles");
    await click(".blog-categories button:nth-child(6)");
    expect(window.location.search).toContain("entry=footer"); expect(window.location.hash).toBe("#articles");
    await input("marketing"); await settle(); await settle(130);
    expect(container.querySelectorAll(".blog-grid article")).toHaveLength(1);
    expect(element(".blog-grid h2").textContent).toContain("digital marketing agency");
    expect(element(".blog-pagination").textContent).toBe("1 / 1");
    await input("존재하지 않는 긴 한국어 검색어"); await settle(); await settle(130);
    expect(element(".blog-status h2").textContent).toBe("No matching articles");
    await click(".blog-status button"); await settle(); await settle(130);
    expect(new URLSearchParams(window.location.search).get("category")).toBe("Start a business");
    await click(".blog-categories button:first-child"); await settle(130);
    await click(".blog-pagination button");
    expect(new URLSearchParams(window.location.search).get("page")).toBe("2");
    expect(window.location.search).toContain("entry=footer"); expect(window.location.hash).toBe("#articles");
  });

  // 기능 : 같은 검색어의 이전 이력으로 돌아갈 때 미확정 입력이 복원된 URL을 덮지 않는지 확인한다.
  it("discards pending input on back even when the committed query is unchanged", async () => {
    await navigate("/blog?category=General&page=2&entry=history#articles"); await settle(130);
    await navigate("/blog?category=General&page=3&entry=history#articles"); await settle(130);
    await input("marketing"); await traverse("back"); await settle();
    expect(currentUrl()).toBe("/blog?category=General&page=2&entry=history#articles");
    expect(element<HTMLInputElement>(".blog-search").value).toBe("");
    await traverse("forward"); await settle();
    expect(new URLSearchParams(window.location.search).get("page")).toBe("3");
  });

  // 기능 : 조합 중 분류 변경은 미확정 글자를 제출하지 않고 이전 조합을 종료한다.
  it("does not publish an unfinished composition when changing category", async () => {
    await act(async () => {
      const field = element<HTMLInputElement>(".blog-search");
      field.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }));
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(field, "마케팅 조합 중");
      field.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await settle();
    expect(window.location.search).toBe("");
    await click(".blog-categories button:nth-child(6)"); await composition("compositionend"); await settle();
    expect(new URLSearchParams(window.location.search).get("q")).toBeNull();
    expect(element<HTMLInputElement>(".blog-search").value).toBe("");
    await composition("compositionstart");
    await act(async () => {
      const field = element<HTMLInputElement>(".blog-search");
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(field, "marketing");
      field.dispatchEvent(new Event("input", { bubbles: true }));
      field.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true }));
    });
    await settle(); await settle(130);
    expect(container.querySelectorAll(".blog-grid article")).toHaveLength(1);
  });

  // 기능 : 현재 검색 초안으로 페이지를 누르면 옛 결과의 페이지가 새 검색에 적용되지 않는지 확인한다.
  it("commits the latest draft on page selection and ignores the old result page", async () => {
    await input("marketing"); await click(".blog-pagination button");
    expect(new URLSearchParams(window.location.search).get("q")).toBe("marketing");
    await settle(); await settle(130);
    expect(new URLSearchParams(window.location.search).get("page")).toBeNull();
    expect(element(".blog-pagination").textContent).toBe("1 / 1");
  });

  // 기능 : 목록의 전체 출발 URL과 기사 query가 목차·추천 왕복에서 유지되는지 확인한다.
  it("retains list origin through TOC and a recommended article round trip", async () => {
    const origin = "/blog?category=Start+a+business&q=marketing&entry=footer#articles";
    await navigate(origin); await settle(130); await click(".blog-card > a");
    expect(element<HTMLAnchorElement>(".article-back").getAttribute("href")).toBe(origin);
    await act(async () => router.navigate(articlePath + "?entry=list", { replace: true, state: router.state.location.state }));
    await click('.article-toc a[href*="find-your-niche"]');
    expect(window.location.search).toBe("?entry=list");
    const parent = currentUrl();
    await click(".article-recommended .blog-card > a");
    expect(element<HTMLAnchorElement>(".article-back").getAttribute("href")).toBe(parent);
    await returnToOrigin(); expect(currentUrl()).toBe(parent);
    await returnToOrigin(); expect(currentUrl()).toBe(origin);
  });

  // 기능 : 가입·로그인 왕복과 취소 뒤에도 기사와 최초 목록의 복귀가 분리되는지 확인한다.
  it("restores article query, hash and origin after signup cancellation", async () => {
    const origin = "/blog?q=marketing#articles";
    await navigate(origin); await settle(130); await click(".blog-card > a");
    await act(async () => router.navigate(articlePath + "?entry=list#find-your-niche", { replace: true, state: router.state.location.state }));
    const article = currentUrl(); await click(".article-banner a");
    await click('.auth-header a[href="/login"]'); await traverse("back");
    await click(".auth-below > .auth-secondary"); expect(currentUrl()).toBe(article);
    expect(element<HTMLAnchorElement>(".article-back").getAttribute("href")).toBe(origin);
    await returnToOrigin(); expect(currentUrl()).toBe(origin);
  });

  // 기능 : 직접 진입·알 수 없는 글·새 공급자 수명에서는 없는 출발 이력을 사용하지 않는다.
  it("uses the default return for direct entries and expired memory origins", async () => {
    await navigate("/blog/not-recorded?entry=direct#unknown");
    expect(element(".article-unavailable h1").textContent).toBe("Article not available");
    expect(element<HTMLAnchorElement>(".article-back").getAttribute("href")).toBe("/blog");
    await navigate("/software/small-businesses?entry=menu#related-content"); await click(".intro-article-grid a");
    await act(async () => root.unmount()); root = createRoot(container); await act(async () => root.render(<App />));
    expect(element<HTMLAnchorElement>(".article-back").getAttribute("href")).toBe("/blog");
  });

  // 기능 : 잘못된 URL·범위 밖 페이지를 실제 표시 결과로 정규화하고 빈 분류와 무결과를 구분한다.
  it("canonicalizes invalid URL values without losing unrelated parameters", async () => {
    await navigate("/blog?category=unknown&page=NaN&entry=direct#articles"); await settle(150);
    expect(currentUrl()).toBe("/blog?entry=direct#articles");
    expect(container.querySelectorAll('.blog-categories [aria-pressed="true"]')).toHaveLength(0);
    await navigate("/blog?category=General&page=999&entry=direct#articles"); await settle(150); await settle(150);
    expect(new URLSearchParams(window.location.search).get("page")).toBe("4");
    expect(element(".blog-pagination").textContent).toContain("4 / 4");
    await click(".blog-categories button:nth-child(4)"); await settle(130);
    expect(element(".blog-status h2").textContent).toBe("No articles available");
    await navigate("/blog?category=Legal&q=marketing"); await settle(130);
    expect(element(".blog-status h2").textContent).toBe("No matching articles");
  });

  // 기능 : 실패 화면이 검색 조건을 보존하고 명시적 재시도로 같은 기사를 읽는지 확인한다.
  it("preserves failed search conditions and retries without clearing inputs", async () => {
    await scenario("read-error");
    const origin = "/blog?category=Start+a+business&q=marketing&entry=retry#articles";
    await navigate(origin); expect(element(".blog-status").textContent).toContain("Loading"); await settle(130);
    expect(element('.blog-results [role="alert"]').textContent).toContain("could not be loaded");
    expect(element<HTMLInputElement>(".blog-search").value).toBe("marketing");
    await click(".blog-status button"); await settle(130);
    expect(currentUrl()).toBe(origin); expect(container.querySelectorAll(".blog-grid article")).toHaveLength(1);
    await scenario("normal");
  });

  // 기능 : 늦은 조회·화면 이탈·Reset이 최신 URL과 새 범위의 결과를 덮지 않는지 확인한다.
  it("isolates slow search, navigation and reset from later results", async () => {
    await scenario("slow"); await navigate("/blog?q=agency");
    await input("marketing"); await settle(); await input("photography"); await settle(); await settle(1560);
    expect(element(".blog-grid h2").textContent).toBe("How to get into photography");
    await input("agency"); await settle(); await navigate("/components"); await click(".preview-tools button");
    expect(element<HTMLSelectElement>(".preview-tools label:last-of-type select").value).toBe("normal");
    await navigate("/blog?q=marketing"); await settle(130); await settle(1550);
    expect(element(".blog-grid h2").textContent).toContain("digital marketing agency");
  }, 10000);

  // 기능 : 잘못된 이메일·중복 제출·로그인 왕복·취소가 기사 URL과 다른 페이지 초안을 보존하는지 확인한다.
  it("hands off sticky email once and clears only the article draft on cancel", async () => {
    await navigate("/crm"); await input("crm@example.test", ".intro-hero input");
    const origin = articlePath + "?entry=email#find-your-niche";
    await navigate(origin); await input("invalid", ".article-signup input");
    await act(async () => element(".article-signup form").dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })));
    expect(element('.article-signup [role="alert"]').textContent).toContain("valid email");
    expect(element<HTMLInputElement>(".article-signup input").value).toBe("invalid");
    await input("blog@example.test", ".article-signup input");
    await act(async () => {
      const form = element(".article-signup form");
      form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
      form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });
    expect(element<HTMLInputElement>("#signup-email").value).toBe("blog@example.test");
    expect(window.location.search).toBe("");
    await traverse("back"); expect(currentUrl()).toBe(origin);
    await traverse("forward"); await click('.auth-header a[href="/login"]'); await traverse("back");
    await click(".auth-below > .auth-secondary"); expect(currentUrl()).toBe(origin);
    expect(element<HTMLInputElement>(".article-signup input").value).toBe("");
    await navigate("/crm"); expect(element<HTMLInputElement>(".intro-hero input").value).toBe("crm@example.test");
  });

  // 기능 : 본문 관련 글·템플릿 연결과 미확인 링크 안내가 기사 출발 이력을 보존하는지 확인한다.
  it("keeps inline article and template handoffs local and exposes the unconfirmed link boundary", async () => {
    const origin = articlePath + "?entry=inline#find-your-niche";
    await navigate(origin); await click('.article-intro a[href="/blog/what-is-a-creative-agency"]');
    expect(element(".article-unavailable h1").textContent).toBe("Article not available");
    await returnToOrigin(); expect(currentUrl()).toBe(origin);
    await click('.article-intro a[href="/templates/contracts"]');
    expect(window.location.pathname).toBe("/templates/contracts");
    expect(container.querySelector(".template-catalog")).not.toBeNull();
    await traverse("back"); expect(currentUrl()).toBe(origin);
    const trigger = element(".article-source-link"); trigger.focus(); await click(".article-source-link");
    expect(element("dialog").textContent).toContain("연결 목적지와 이후 화면은 확인되지 않았습니다");
    await click(".dialog__close"); expect(document.activeElement).toBe(trigger); expect(currentUrl()).toBe(origin);
  });

  // 기능 : 목차의 hash 선택과 실제 읽는 위치를 분리하고 이탈 시 리스너가 정리되는지 확인한다.
  it("tracks the measured reading position independently of the selected hash", async () => {
    const remove = vi.spyOn(window, "removeEventListener");
    // 기능 : jsdom에 없는 위치 계산만 공급하고 실제 링크 이동은 그대로 사용한다.
    vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function position(this: Element) {
      const top = this.id === "article-body" ? 300 : this.id === "personal-foundation" ? -200 : this.id === "find-your-niche" ? 100 : 700;
      return new DOMRect(0, top, 100, 100);
    });
    await navigate(articlePath + "?entry=toc"); await click('.article-toc a[href*="business-model"]');
    expect(element('.article-toc [aria-current="location"]').textContent).toBe("2. Find your niche");
    expect(window.location.hash).toBe("#business-model"); expect(window.location.search).toBe("?entry=toc");
    expect(element(".article-recommended").classList.contains("is-visible")).toBe(true);
    await navigate("/blog");
    expect(remove.mock.calls.some(([name]) => name === "scroll")).toBe(true);
    expect(remove.mock.calls.some(([name]) => name === "resize")).toBe(true);
  });
});

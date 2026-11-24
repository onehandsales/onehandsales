import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "../app";
import { router } from "./router";

let container: HTMLDivElement;
let root: Root;
const quote = "/quote-template/ecommerce-website";
const scrollDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollIntoView");
const dialogMethods = ["showModal", "close"] as const;
const dialogDescriptors = dialogMethods.map(name => Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, name));

// 기능 : 실제 앱과 브라우저 라우터를 연결하고 jsdom에 없는 레이아웃·모달 API만 대체한다.
beforeEach(async () => {
  vi.stubGlobal("matchMedia", (query: string) => ({ matches: query === "(min-width: 992px)", media: query, addEventListener() {}, removeEventListener() {} }));
  vi.stubGlobal("scrollTo", () => {});
  vi.stubGlobal("IntersectionObserver", class { observe() {} disconnect() {} unobserve() {} });
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value() {} });
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", { configurable: true, value(this: HTMLDialogElement) { this.open = true; } });
  Object.defineProperty(HTMLDialogElement.prototype, "close", { configurable: true, value(this: HTMLDialogElement) { this.open = false; } });
  container = document.createElement("div"); document.body.append(container); root = createRoot(container);
  await router.navigate("/templates", { replace: true });
  await act(async () => root.render(<App />)); await settle(130);
});

// 기능 : 공급자·조회 수명을 종료하고 테스트에서 대체한 브라우저 기능을 원복한다.
afterEach(async () => {
  await act(async () => root.unmount()); container.remove(); vi.unstubAllGlobals(); vi.restoreAllMocks();
  if (scrollDescriptor) Object.defineProperty(HTMLElement.prototype, "scrollIntoView", scrollDescriptor);
  else Reflect.deleteProperty(HTMLElement.prototype, "scrollIntoView");
  // 기능 : 네이티브 Dialog 메서드의 원래 상태를 테스트 이후 복원한다.
  dialogMethods.forEach(function restoreDialog(name, index) {
    const descriptor = dialogDescriptors[index];
    if (descriptor) Object.defineProperty(HTMLDialogElement.prototype, name, descriptor);
    else Reflect.deleteProperty(HTMLDialogElement.prototype, name);
  });
});

// 기능 : 화면에 필수 요소가 없으면 해당 동작 검증을 실패시킨다.
function element<T extends HTMLElement = HTMLElement>(selector: string): T {
  const target = container.querySelector<T>(selector);
  if (!target) throw new Error(`Missing element: ${selector}`);
  return target;
}
// 기능 : 메모리 조회와 React 상태 반영을 기다린다.
async function settle(ms = 240) { await act(async () => { await new Promise(resolve => setTimeout(resolve, ms)); }); }
// 기능 : 실제 앱 라우터로 공개 URL에 진입한다.
async function navigate(path: string) { await act(async () => router.navigate(path)); }
// 기능 : DOM의 링크·버튼 이벤트로 화면을 이동하거나 상태를 바꾼다.
async function click(selector: string) { await act(async () => element(selector).click()); }
// 기능 : 네이티브 입력 이벤트로 제어 입력의 초안을 바꾼다.
async function input(value: string, selector = ".template-search input") {
  const target = element<HTMLInputElement>(selector);
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(target, value);
    target.dispatchEvent(new Event("input", { bubbles: true }));
  });
}
// 기능 : 실제 history의 비동기 앞뒤 이동이 끝날 때까지 기다린다.
async function traverse(direction: "back" | "forward") {
  await act(async () => {
    const changed = new Promise<void>(resolve => window.addEventListener("popstate", () => resolve(), { once: true }));
    window.history[direction](); await changed;
  });
}
// 기능 : 복귀 링크가 발생시킨 실제 POP으로 출발 목록에 돌아간다.
async function backToCatalog() {
  await act(async () => {
    const changed = new Promise<void>(resolve => window.addEventListener("popstate", () => resolve(), { once: true }));
    element('.template-breadcrumb a:nth-of-type(2)').click(); await changed;
  });
}
// 기능 : 경로와 query·hash 전체를 읽어 복귀 손실을 확인한다.
function currentUrl() { return location.pathname + location.search + location.hash; }
// 기능 : OS IME와 구분되는 합성 조합 이벤트를 검색 입력에 전달한다.
async function composition(type: "compositionstart" | "compositionend") {
  await act(async () => element(".template-search input").dispatchEvent(new CompositionEvent(type, { bubbles: true })));
}
// 기능 : 기존 개발 도구로 목 조회의 실패·지연 시나리오를 선택한다.
async function scenario(value: string) {
  await navigate("/components");
  await act(async () => {
    const field = element<HTMLSelectElement>(".preview-tools label:last-of-type select");
    field.value = value; field.dispatchEvent(new Event("change", { bubbles: true }));
  });
}

// 기능 : 공개 템플릿 검색·상세·인계의 사용자 결과를 실제 라우터로 검증한다.
describe("G06 template routes and connected handoffs", () => {
  // 기능 : 유형 경로의 All 선택과 잘못된 URL 정규화가 표시 상태와 일치하는지 확인한다.
  it("selects All from a typed path and preserves unrelated query and hash", async () => {
    await navigate("/templates/quotes?entry=menu#catalog"); await settle(130);
    await click(".template-type-filters button:first-child"); await settle(130);
    expect(element('.template-type-filters [aria-pressed="true"]').textContent).toBe("All");
    expect(location.hash).toBe("#catalog"); expect(location.search).toContain("entry=menu");
    await navigate("/templates?type=bogus&industry=bogus&page=NaN&entry=direct#catalog"); await settle(150);
    expect(currentUrl()).toBe("/templates?entry=direct#catalog");
    expect(container.querySelectorAll(".template-card")).toHaveLength(24);
    await navigate("/templates?type=Invoices&industry=General&q=itemized&page=999&entry=direct#catalog"); await settle(150); await settle(150);
    expect(new URLSearchParams(location.search).has("page")).toBe(false);
    expect(element(".template-pagination").textContent).toContain("1 / 1");
  });

  // 기능 : 검색 확정 전 페이지·업종 선택이 최신 입력과 독립 필터를 함께 반영하는지 확인한다.
  it("commits a pending search before paging and keeps industry filters independent", async () => {
    await navigate("/templates?page=2&entry=filter#catalog"); await settle(130);
    await input("itemized"); await click(".template-pagination button:last-child");
    await settle(); await settle(130);
    expect(new URLSearchParams(location.search).get("q")).toBe("itemized");
    expect(new URLSearchParams(location.search).has("page")).toBe(false);
    expect(element(".template-pagination").textContent).toContain("1 / 1");
    await input("");
    await act(async () => {
      const industry = [...container.querySelectorAll<HTMLButtonElement>(".template-industries button")].find(button => button.textContent === "General");
      expect(industry).toBeDefined(); industry!.click();
    });
    await click(".template-type-filters button:nth-child(5)"); await settle(); await settle(130);
    const selected = new URLSearchParams(location.search);
    expect(selected.get("type")).toBe("Invoices"); expect(selected.get("industry")).toBe("General");
    expect(selected.has("q")).toBe(false); expect(selected.get("entry")).toBe("filter");
    expect(element('.template-industries [aria-pressed="true"]').textContent).toBe("General");
    expect(container.querySelectorAll(".template-card").length).toBeGreaterThan(0);
    await click('.template-industries [aria-label="All industries"]'); await settle(130);
    expect(new URLSearchParams(location.search).has("industry")).toBe(false);
    expect(new URLSearchParams(location.search).get("type")).toBe("Invoices");
    expect(location.hash).toBe("#catalog");
  });

  // 기능 : 동일 검색어의 다른 이력으로 POP할 때 미확정 입력이 과거 URL을 덮지 않는지 확인한다.
  it("discards uncommitted search on back and forward between equal queries", async () => {
    await navigate("/templates?page=2&entry=history#catalog"); await settle(130);
    await navigate("/templates?page=3&entry=history#catalog"); await settle(130);
    await input("ecommerce"); await traverse("back"); await settle();
    expect(currentUrl()).toBe("/templates?page=2&entry=history#catalog");
    expect(element<HTMLInputElement>(".template-search input").value).toBe("");
    await traverse("forward"); await settle();
    expect(new URLSearchParams(location.search).get("page")).toBe("3");
  });

  // 기능 : 목차·가입 취소 후 전체 상세 URL과 최초 목록 이력이 복원되는지 확인한다.
  it("returns to the original catalog after TOC, signup and cancellation", async () => {
    const origin = "/templates?type=Quotes&q=ecommerce&entry=list#catalog";
    await navigate(origin); await settle(130); await click(".template-card");
    await act(async () => router.navigate(quote + "?entry=detail", { replace: true, state: router.state.location.state }));
    await click('.quote-reading aside a:last-child');
    expect(location.search).toBe("?entry=detail");
    await click(".template-detail-hero .public-button");
    await click('.auth-header a[href="/login"]'); await traverse("back");
    await click(".auth-below > .auth-secondary");
    expect(currentUrl()).toBe(quote + "?entry=detail#quote-section-2");
    expect(element<HTMLAnchorElement>('.template-breadcrumb a:nth-of-type(2)').getAttribute("href")).toBe(origin);
    await backToCatalog(); expect(currentUrl()).toBe(origin);
  });

  // 기능 : 조합 중 필터 변경·검색 지우기·조합 확정이 마지막 입력만 반영하는지 확인한다.
  it("separates composition drafts from filters and explicit clearing", async () => {
    await navigate("/templates?q=unmatched#catalog"); await settle(130);
    await composition("compositionstart"); await input("한글 조합 중"); await settle();
    expect(location.search).toBe("?q=unmatched");
    await click('.template-type-filters button:nth-child(6)'); await settle(130);
    expect(element<HTMLInputElement>(".template-search input").value).toBe("unmatched");
    await composition("compositionstart"); await input("지우기 전 초안"); await click(".template-empty button"); await settle();
    expect(new URLSearchParams(location.search).has("q")).toBe(false);
    expect(location.hash).toBe("#catalog");
    await composition("compositionstart"); await input("ecommerce"); await composition("compositionend"); await settle(); await settle(130);
    expect(container.querySelectorAll(".template-card")).toHaveLength(1);
    expect(element(".template-card").getAttribute("href")).toBe(quote);
  });

  // 기능 : 빈 카탈로그·검색 무결과·실패와 재시도를 서로 다른 상태로 확인한다.
  it("preserves query after failure and distinguishes empty and no match", async () => {
    await scenario("read-error"); const url = "/templates?type=Quotes&q=ecommerce#catalog";
    await navigate(url); await settle(130); expect(element('[role="alert"]').textContent).toContain("could not be loaded");
    await click('.template-results [role="alert"] button'); await settle(130);
    expect(currentUrl()).toBe(url); expect(container.querySelectorAll(".template-card")).toHaveLength(1);
    await scenario("empty"); await navigate("/templates"); await settle(130);
    expect(element(".template-empty h2").textContent).toBe("No templates available");
    await scenario("normal"); await navigate("/templates?q=no-such-template"); await settle(130);
    expect(element(".template-empty h2").textContent).toBe("No matching templates");
  });

  // 기능 : 느린 조회와 Reset 이전 입력이 새 범위의 결과를 덮지 않는지 확인한다.
  it("cancels stale slow queries and restores the normal scenario on reset", async () => {
    await scenario("slow"); await navigate("/templates?q=itemized");
    await input("ecommerce"); await settle(); await settle(1550);
    expect(element(".template-card").textContent).toContain("eCommerce");
    await input("itemized"); await settle(); await navigate("/components"); await click(".preview-tools button");
    expect(element<HTMLSelectElement>(".preview-tools label:last-of-type select").value).toBe("normal");
    await navigate("/templates?type=Quotes&q=ecommerce"); await settle(130); await settle(1550);
    expect(container.querySelectorAll(".template-card")).toHaveLength(1);
    expect(element(".template-card").getAttribute("href")).toBe(quote);
  }, 10000);

  // 기능 : 직접 진입·잘못된 분류·초기화·메모리 재생성의 복귀 경계를 확인한다.
  it("expires catalog origin on reset and provider remount", async () => {
    await navigate("/templates/not-a-category"); expect(element(".template-unavailable h1").textContent).toBe("Template category unavailable");
    await navigate("/templates/scopes-of-work"); expect(element(".template-unavailable h1").textContent).toBe("Scope of Work Templates");
    await navigate("/quote-template/not-in-catalog"); expect(container.querySelector(".template-detail")).toBeNull(); expect(element(".not-found-code").textContent).toBe("404");
    await navigate(quote); expect(element('.template-breadcrumb a:nth-of-type(2)').getAttribute("href")).toBe("/templates");
    await navigate("/templates?type=Quotes&q=ecommerce"); await settle(130); await click(".template-card");
    const state = router.state.location.state;
    await navigate("/components"); await click(".preview-tools button");
    await act(async () => router.navigate(quote, { state }));
    expect(element('.template-breadcrumb a:nth-of-type(2)').getAttribute("href")).toBe("/templates");
    await navigate("/templates?type=Quotes&q=ecommerce"); await settle(130); await click(".template-card");
    await act(async () => root.unmount()); root = createRoot(container); await act(async () => root.render(<App />));
    expect(element('.template-breadcrumb a:nth-of-type(2)').getAttribute("href")).toBe("/templates");
  });

  // 기능 : 선택 A·B의 이력 snapshot과 취소 범위를 독립적으로 확인한다.
  it("keeps independent template snapshots across history and signup cancellation", async () => {
    await navigate(quote); await click(".template-detail-hero .public-button");
    const a = window.history.state.usr.publicIntentId;
    expect(element(".template-handoff-summary").textContent).toContain("eCommerce");
    await traverse("back"); await navigate("/a/freelance-invoice-template"); await click(".template-detail-hero .public-button");
    expect(window.history.state.usr.publicIntentId).not.toBe(a);
    expect(element(".template-handoff-summary").textContent).toContain("Freelance Invoice Template");
    await traverse("back"); await traverse("back"); await traverse("forward"); await traverse("forward");
    expect(element(".template-handoff-summary").textContent).toContain("Freelance Invoice Template");
    await click(".auth-below > .auth-secondary"); expect(location.pathname).toBe("/a/freelance-invoice-template");
    await act(async () => router.navigate("/signup", { state: { publicIntentId: a } }));
    expect(element(".template-handoff-summary").textContent).toContain("eCommerce");
  });

  // 기능 : Customize의 오류·중복 제출·취소가 이메일 유출과 다른 공개 초안 손실을 만들지 않는지 확인한다.
  it("submits Customize once without exposing email in history and clears only its draft", async () => {
    await navigate("/crm"); await input("crm@example.test", ".intro-hero input");
    vi.stubGlobal("scrollY", 600); const url = quote + "?entry=email#quote-section-2";
    await navigate(url); await input("invalid", ".template-customize input");
    await act(async () => element(".template-customize form").dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })));
    expect(element('.template-customize [role="alert"]').textContent).toContain("valid email");
    await input("template@example.test", ".template-customize input");
    await act(async () => {
      const form = element(".template-customize form");
      form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
      form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });
    expect(element<HTMLInputElement>("#signup-email").value).toBe("template@example.test");
    expect(JSON.stringify(window.history.state)).not.toContain("template@example.test"); expect(location.search).toBe("");
    expect(element(".template-handoff-summary").textContent).toContain("Bonsai");
    await traverse("back"); expect(currentUrl()).toBe(url); await traverse("forward");
    await click(".auth-below > .auth-secondary"); expect(currentUrl()).toBe(url);
    expect(element<HTMLInputElement>(".template-customize input").value).toBe("");
    await navigate("/crm"); expect(element<HTMLInputElement>(".intro-hero input").value).toBe("crm@example.test");
  });

  // 기능 : 로컬 로그인 이후 선택 상세의 query·hash를 유지하고 계정 문서 생성과 구분한다.
  it("continues the selected template after local login with full return URL", async () => {
    const url = quote + "?entry=login#quote-section-2";
    await navigate(url); await click(".template-detail-hero .public-button"); await click('.auth-header a[href="/login"]');
    await click(".auth-samples button:first-of-type"); await settle(700);
    expect(element(".auth-boundary").textContent).toContain("templates are not copied to an account");
    await click(".auth-boundary .auth-primary"); expect(currentUrl()).toBe(url);
    expect(element('.template-breadcrumb a:nth-of-type(2)').getAttribute("href")).toBe("/templates");
  });

  // 기능 : 청구서의 서로 다른 CTA·15개 로컬 링크·Google 안내 닫기와 생성기 왕복을 확인한다.
  it("keeps invoice anchor, local formats, inline details and generator actions distinct", async () => {
    const url = "/invoice-template?entry=menu"; await navigate(url);
    await click('.invoice-hero-actions a[href*="#download-invoice"]'); expect(currentUrl()).toBe(url + "#download-invoice");
    const files = [...container.querySelectorAll<HTMLAnchorElement>(".invoice-download-grid a[download]")];
    expect(files).toHaveLength(15); expect(new Set(files.map(a => a.pathname)).size).toBe(15);
    expect(files.every(a => a.origin === location.origin && /\.(pdf|docx|xlsx)$/.test(a.download))).toBe(true);
    const trigger = element(".invoice-download-card nav button"); trigger.focus(); await click(".invoice-download-card nav button");
    expect(element("dialog").textContent).toContain("실제 Google 로그인이나 문서 복사를 실행하지 않았습니다");
    await act(async () => element("dialog").dispatchEvent(new Event("cancel", { cancelable: true })));
    expect(container.querySelector("dialog")).toBeNull(); expect(document.activeElement).toBe(trigger);
    await click(".invoice-download-card nav button"); await click(".dialog__close"); expect(document.activeElement).toBe(trigger);
    const unconfirmed = element(".invoice-format-comparison button.invoice-inline-link");
    unconfirmed.focus(); await click(".invoice-format-comparison button.invoice-inline-link");
    expect(element("dialog").textContent).toContain("연결 목적지와 이후 화면은 확인되지 않았습니다");
    await click(".dialog__close"); expect(document.activeElement).toBe(unconfirmed);
    expect(currentUrl()).toBe(url + "#download-invoice");
    await click('.invoice-industries .invoice-inline-link'); expect(location.pathname).toBe("/invoice-template/contractor");
    await backToCatalog(); expect(currentUrl()).toBe(url + "#download-invoice");
    await click('.invoice-industries .public-button'); expect(location.pathname).toBe("/a/independent-contractor-invoice");
    await backToCatalog(); await click(".invoice-generator-link"); expect(location.pathname).toBe("/invoice-generator");
    await traverse("back"); expect(currentUrl()).toBe(url + "#download-invoice");
    await click(".invoice-download-card a[href='/signup']"); expect(element(".template-handoff-summary").textContent).toContain("Invoice Template");
    await click(".auth-below > .auth-secondary"); expect(currentUrl()).toBe(url + "#download-invoice");
  });
});

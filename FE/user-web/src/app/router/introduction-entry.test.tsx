import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "../app";
import { router } from "./router";

let container: HTMLDivElement;
let root: Root;
const missingDomMethods = [
  [HTMLElement.prototype, "scrollIntoView"],
  [HTMLDialogElement.prototype, "showModal"],
  [HTMLDialogElement.prototype, "close"],
] as const;
const originalMethods = missingDomMethods.map(([prototype, name]) => Object.getOwnPropertyDescriptor(prototype, name));

// 기능 : 실제 공급자·라우터를 사용하고 jsdom에 없는 화면·네이티브 모달 기능만 대체한다.
beforeEach(async () => {
  vi.stubGlobal("matchMedia", (query: string) => ({ matches: query === "(min-width: 992px)", media: query, addEventListener() {}, removeEventListener() {} }));
  vi.stubGlobal("scrollTo", () => {});
  vi.stubGlobal("IntersectionObserver", class { observe() {} disconnect() {} unobserve() {} });
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value() {} });
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", { configurable: true, value(this: HTMLDialogElement) { this.open = true; } });
  Object.defineProperty(HTMLDialogElement.prototype, "close", { configurable: true, value(this: HTMLDialogElement) { this.open = false; } });
  container = document.createElement("div"); document.body.append(container); root = createRoot(container);
  await router.navigate("/software/small-businesses", { replace: true });
  await act(async () => root.render(<App />));
});

// 기능 : 검증마다 공급자 메모리와 DOM·대체 기능을 정리한다.
afterEach(async () => {
  await act(async () => root.unmount()); container.remove(); vi.unstubAllGlobals();
  missingDomMethods.forEach(([prototype, name], index) => {
    const descriptor = originalMethods[index];
    if (descriptor) Object.defineProperty(prototype, name, descriptor);
    else Reflect.deleteProperty(prototype, name);
  });
});

// 기능 : 필수 표시 요소의 누락을 즉시 실패로 판정한다.
function element<T extends HTMLElement = HTMLElement>(selector: string): T {
  const node = container.querySelector<T>(selector);
  if (!node) throw new Error(`Missing element: ${selector}`);
  return node;
}

// 기능 : 실제 DOM 클릭으로 이동과 상태 전이를 실행한다.
async function click(selector: string) { await act(async () => element(selector).click()); }
// 기능 : 이동 함수를 대체하지 않고 실제 앱 라우터로 경로를 전환한다.
async function navigate(path: string) { await act(async () => router.navigate(path)); }
// 기능 : 실제 history의 이동 이벤트까지 기다려 이력별 복귀를 확인한다.
async function traverse(direction: "back" | "forward") {
  await act(async () => {
    const changed = new Promise<void>(resolve => window.addEventListener("popstate", () => resolve(), { once: true }));
    window.history[direction](); await changed;
  });
}
// 기능 : 제어 입력에 네이티브 값 변경과 입력 이벤트를 전달한다.
async function input(value: string) {
  const field = element<HTMLInputElement>(".intro-hero input");
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(field, value);
    field.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

// 기능 : 세 소개와 기존 소비 화면의 실제 라우터·메모리 인계 회귀를 묶는다.
describe("G03 introduction routes and connected handoffs", () => {
  // 기능 : 관련 글 페이지 이동과 이력 복귀가 다른 query·미수록 안내·초점을 보존하는지 검증한다.
  it("preserves other query values through pagination and real back/forward", async () => {
    await navigate("/software/small-businesses?entry=menu&contentPage=1#related-content");
    await click(".intro-pagination a");
    expect(window.location.search).toBe("?entry=menu&contentPage=2");
    expect(window.location.hash).toBe("#related-content");
    expect(element(".intro-content-unavailable").textContent).toContain("아직 확인되지 않았습니다");
    expect(container.querySelectorAll(".intro-article-grid article")).toHaveLength(0);
    expect(document.activeElement).toBe(element(".intro-articles h2"));
    await traverse("back"); expect(container.querySelectorAll(".intro-article-grid article")).toHaveLength(12);
    await traverse("forward"); expect(element(".intro-pagination p").textContent).toBe("2 / 2");
    await click(".intro-pagination a"); expect(window.location.search).toBe("?entry=menu&contentPage=1");
  });

  // 기능 : 기사 복귀 링크와 이력 복귀가 출발 소개의 query·hash를 유지하는지 검증한다.
  it("keeps the full introduction URL on the article return link and returns by history", async () => {
    const origin = "/software/small-businesses?contentPage=1#related-content";
    await navigate(origin);
    const articlePath = element<HTMLAnchorElement>(".intro-article-grid a").pathname;
    await click(".intro-article-grid a"); expect(window.location.pathname).toBe(articlePath);
    expect(element<HTMLAnchorElement>(".article-back").getAttribute("href")).toBe(origin);
    await act(async () => {
      const changed = new Promise<void>(resolve => window.addEventListener("popstate", () => resolve(), { once: true }));
      element(".article-back").click(); await changed;
    });
    expect(window.location.pathname + window.location.search + window.location.hash).toBe(origin);
    expect(container.querySelectorAll(".intro-article-grid article")).toHaveLength(12);
  });

  // 기능 : FAQ 접근성 연결과 연속 선택·재진입 상태를 검증한다.
  it("keeps FAQ state and accessible associations local to CRM reentry", async () => {
    await navigate("/crm");
    expect(container.querySelectorAll('.intro-faq [aria-expanded="true"]')).toHaveLength(0);
    await click("#crm-faq-1-question");
    expect(element("#crm-faq-1-question").getAttribute("aria-controls")).toBe("crm-faq-1-answer");
    expect(element("#crm-faq-1-answer").hidden).toBe(false);
    expect(element("#crm-faq-1-answer").getAttribute("aria-labelledby")).toBe("crm-faq-1-question");
    await click("#crm-faq-2-question"); expect(element("#crm-faq-1-answer").hidden).toBe(true);
    await act(async () => { element("#crm-faq-2-question").click(); element("#crm-faq-2-question").click(); });
    expect(element("#crm-faq-2-answer").hidden).toBe(false);
    await click("#crm-faq-3-question");
    await click('#crm-faq-3-answer a[href="/software/consulting"]');
    await traverse("back"); expect(container.querySelectorAll('.intro-faq [aria-expanded="true"]')).toHaveLength(0);
  });

  // 기능 : demo 취소·닫기 뒤 호출 초점과 스크롤 잠금 상태 복구를 검증한다.
  it("closes the local demo through cancel and restores the invoking focus and scroll lock", async () => {
    const trigger = element(".intro-outline"); trigger.focus();
    const previousOverflow = document.body.style.overflow;
    await click(".intro-outline");
    expect(element("dialog").textContent).toContain("예약이나 이메일을 전송하지 않습니다");
    expect(document.activeElement).toBe(element("[data-dialog-heading]"));
    await act(async () => element("dialog").dispatchEvent(new Event("cancel", { cancelable: true })));
    expect(container.querySelector("dialog")).toBeNull();
    expect(document.activeElement).toBe(trigger);
    expect(document.body.style.overflow).toBe(previousOverflow);
    await click(".intro-outline"); await click(".dialog__close"); expect(document.activeElement).toBe(trigger);
  });

  // 기능 : CRM 양식 상세·목록·가입 목적지와 선택 인계·취소 복귀를 검증한다.
  it("separates CRM template detail, all templates and signup without losing selection", async () => {
    await navigate("/crm");
    expect(container.querySelectorAll(".intro-template-card")).toHaveLength(12);
    await click(".intro-template-card"); expect(window.location.pathname).toBe("/form-template/tax-intake-form");
    expect(element("h1").textContent).toBe("Tax intake form");
    await click(".template-detail-hero a"); expect(window.location.pathname).toBe("/signup");
    expect(container.textContent).toContain("Tax intake form");
    await click(".auth-below > .auth-secondary"); expect(window.location.pathname).toBe("/form-template/tax-intake-form");
    await traverse("back"); expect(window.location.pathname).toBe("/form-template/tax-intake-form");
    await traverse("back"); expect(window.location.pathname).toBe("/crm");
    await click(".intro-templates > .public-button"); expect(window.location.pathname).toBe("/templates/forms");
    await traverse("back"); await click(".intro-resource-cta a");
    expect(window.location.pathname).toBe("/signup"); expect(element<HTMLInputElement>("#signup-email").value).toBe("");
    await click(".auth-below > .auth-secondary"); expect(window.location.pathname).toBe("/crm");
  });

  // 기능 : 소개별 초안 격리와 오류 수정·가입 로그인 왕복·이전 인계 취소를 검증한다.
  it("isolates CRM and consulting drafts, retries invalid input and cancels the older intent", async () => {
    await navigate("/crm"); await input("긴한국어입력".repeat(20)); await click(".intro-hero form button");
    expect(element('[role="alert"]').textContent).toContain("valid email");
    await input("crm@example.test"); await click(".intro-hero form button");
    await click('.auth-header a[href="/login"]'); expect(element<HTMLInputElement>("#login-email").value).toBe("crm@example.test");
    await traverse("back");
    await navigate("/software/consulting"); await input("consulting@example.test"); await click(".intro-hero form button");
    await traverse("back"); await traverse("back"); expect(element<HTMLInputElement>("#signup-email").value).toBe("crm@example.test");
    await click(".auth-below > .auth-secondary"); expect(window.location.pathname).toBe("/crm");
    expect(element<HTMLInputElement>(".intro-hero input").value).toBe("");
    await navigate("/software/consulting"); expect(element<HTMLInputElement>(".intro-hero input").value).toBe("consulting@example.test");
  });

  // 기능 : 원본 제목·정적 목업·문구 불일치를 유지하고 스크롤로 세션이 생기지 않는지 검증한다.
  it("retains observed titles and static mockups without creating a session on scroll", async () => {
    for (const [path, title] of [["/software/small-businesses", "Small business management software"], ["/software/consulting", "The business software for consultants"], ["/crm", "CRM Software to keep clients & projects organized"]]) {
      await navigate(path!); expect(element("h1").textContent).toBe(title);
      expect(container.querySelector(".intro-hero-art button, .intro-hero-art input, .intro-banner-art button, .intro-banner-art input")).toBeNull();
      await act(async () => window.dispatchEvent(new Event("scroll")));
      expect(element(".public-auth-links").textContent).toContain("Log in");
    }
    await navigate("/software/consulting");
    const features = Array.from(container.querySelectorAll(".intro-feature-grid article"));
    expect(features.filter(node => node.querySelector("h3")?.textContent === "Time tracking")).toHaveLength(2);
    expect(features[0]?.textContent).toContain("Set up recurring invoicing and get paid on time.");
  });
});

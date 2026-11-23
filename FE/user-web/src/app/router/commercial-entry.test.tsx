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
  await router.navigate("/pricing", { replace: true });
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

// 기능 : 가격·후기와 인증·구독 인계의 실제 라우터 회귀를 검증한다.
describe("G04 commercial routes and connected handoffs", () => {
  // 기능 : 주기 전환이 다른 query·hash와 이력별 선택을 유지하는지 확인한다.
  it("preserves the full URL through billing changes and history", async () => {
    await navigate("/pricing?entry=footer&billing=unknown#plans");
    expect(element<HTMLInputElement>('input[value="yearly"]').checked).toBe(true);
    await click('input[value="monthly"]');
    expect(window.location.search).toBe("?entry=footer&billing=monthly");
    expect(window.location.hash).toBe("#plans");
    await traverse("back"); expect(element<HTMLInputElement>('input[value="yearly"]').checked).toBe(true);
    await traverse("forward"); expect(element<HTMLInputElement>('input[value="monthly"]').checked).toBe(true);
  });

  // 기능 : 상하단 CTA가 동일한 가격 snapshot을 전달하고 취소 시 출발 URL을 복원하는지 확인한다.
  it("hands off the same plan from both CTAs and restores query and hash on cancel", async () => {
    const origin = "/pricing?billing=monthly&entry=footer#plans";
    for (const selector of ['.is-recommended .pricing-plan-summary a', '.is-recommended .pricing-bottom-cta']) {
      await navigate(origin); await click(selector);
      expect(window.location.pathname).toBe("/signup");
      expect(element(".plan-handoff-summary").textContent).toContain("Professional");
      expect(element(".plan-handoff-summary").textContent).toContain("$39 USD");
      expect(element(".plan-handoff-summary").textContent).toContain("bonsai-public-legacy-20240118-catalog2146");
      expect(element(".plan-handoff-summary").textContent).not.toContain("Calculated annual subtotal");
      await click(".auth-below > .auth-secondary");
      expect(window.location.pathname + window.location.search + window.location.hash).toBe(origin);
    }
  });

  // 기능 : 같은 프레임의 연속 주기 선택과 중복 CTA가 마지막 주기·첫 플랜만 인계하는지 확인한다.
  it("uses the latest billing value and ignores duplicate plan submission", async () => {
    await act(async () => {
      element('input[value="monthly"]').click(); element('input[value="yearly"]').click();
      const first = element('.is-recommended .pricing-plan-summary a');
      const second = element('.pricing-plan:last-child .pricing-bottom-cta');
      first.click(); second.click();
    });
    expect(element(".plan-handoff-summary").textContent).toContain("Professional");
    expect(element(".plan-handoff-summary").textContent).toContain("$384 USD");
    await traverse("back"); expect(window.location.pathname).toBe("/pricing");
    await traverse("forward"); expect(element(".plan-handoff-summary").textContent).toContain("Professional");
  });

  // 기능 : 이전 플랜 이력·로그인 왕복·다른 소개 초안을 새 플랜 선택과 분리한다.
  it("keeps older plan snapshots and unrelated drafts through auth round trips", async () => {
    await navigate("/crm"); await input("crm@example.test");
    await navigate("/pricing"); await click('.pricing-plan:first-child .pricing-plan-summary a');
    await click('.auth-header a[href="/login"]');
    expect(element(".plan-handoff-summary").textContent).toContain("$252 USD");
    await traverse("back");
    await navigate("/pricing?billing=monthly"); await click('.pricing-plan:last-child .pricing-bottom-cta');
    expect(element(".plan-handoff-summary").textContent).toContain("$79 USD");
    await traverse("back"); await traverse("back");
    expect(element(".plan-handoff-summary").textContent).toContain("$252 USD");
    await click(".auth-below > .auth-secondary");
    await navigate("/crm"); expect(element<HTMLInputElement>(".intro-hero input").value).toBe("crm@example.test");
  });

  // 기능 : 명시적 가상 세션만 G79 경계를 열고 사용자 변경과 Reset이 오래된 인계를 폐기하는지 확인한다.
  it("limits signed-in selection to G79 and invalidates intent on scope change and reset", async () => {
    await navigate("/components");
    await act(async () => {
      const select = element<HTMLSelectElement>(".preview-tools select"); select.value = "preview-a";
      select.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await navigate("/pricing?billing=yearly"); await click('.pricing-plan:last-child .pricing-bottom-cta');
    expect(window.location.pathname).toBe("/preview/subscription");
    expect(element(".plan-handoff-summary").textContent).toContain("$792 USD");
    expect(element(".plan-handoff-summary").textContent).toContain("구독·역할·권한은 변경되지 않습니다");
    await click(".public-pending button");
    expect(window.location.pathname + window.location.search).toBe("/pricing?billing=yearly");
    await click('.pricing-plan:last-child .pricing-bottom-cta');
    await navigate("/components");
    expect(element<HTMLSelectElement>(".preview-tools select").value).toBe("preview-a");
    await act(async () => {
      const select = element<HTMLSelectElement>(".preview-tools select"); select.value = "preview-b";
      select.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await traverse("back"); expect(container.querySelector(".plan-handoff-summary")).toBeNull();
    await navigate("/pricing?billing=monthly"); await click('.is-recommended .pricing-bottom-cta');
    expect(element(".plan-handoff-summary").textContent).toContain("$39 USD");
    await navigate("/components"); await click(".preview-tools button");
    await traverse("back"); expect(container.querySelector(".plan-handoff-summary")).toBeNull();
  });

  // 기능 : 후기 출처 안내의 취소와 이력 복귀가 query·hash를 잃지 않는지 확인한다.
  it("keeps review origin query and hash through local outbound cancellation", async () => {
    const origin = "/reviews?entry=footer#review-11-brianna";
    await navigate(origin); await click('.reviews-ratings a');
    expect(window.location.pathname).toBe("/outbound/reviews/g2");
    await traverse("back"); await traverse("forward");
    await click(".public-pending button");
    expect(window.location.pathname + window.location.search + window.location.hash).toBe(origin);
    expect(container.querySelectorAll(".review-card")).toHaveLength(30);
    expect(container.querySelectorAll('.reviews-ratings a[href^="/outbound/reviews/"], .review-card a[href^="/outbound/reviews/"]')).toHaveLength(13);
  });

  // 기능 : 후기 가입 CTA도 출발 URL을 보존하고 로그인 왕복 후 취소할 수 있는지 확인한다.
  it("restores the reviews URL after signup and login cancellation", async () => {
    const origin = "/reviews?entry=footer#review-11-brianna";
    await navigate(origin); await click('.reviews-heading > a');
    await click('.auth-header a[href="/login"]'); await traverse("back");
    await click(".auth-below > .auth-secondary");
    expect(window.location.pathname + window.location.search + window.location.hash).toBe(origin);
  });

  // 기능 : 영상 안내의 닫기·초점·스크롤 복원과 미디어 미제공 경계를 확인한다.
  it("restores focus and scroll lock after video cancel and clears modal on reentry", async () => {
    await navigate("/reviews");
    const trigger = element(".review-video-poster"); trigger.focus();
    const overflow = document.body.style.overflow;
    await click(".review-video-poster");
    expect(element("dialog").textContent).toContain("영상 파일과 자막이 제공되지 않습니다");
    expect(container.querySelector("video, iframe, audio")).toBeNull();
    expect(document.activeElement).toBe(element("[data-dialog-heading]"));
    await act(async () => element("dialog").dispatchEvent(new Event("cancel", { cancelable: true })));
    expect(document.activeElement).toBe(trigger); expect(document.body.style.overflow).toBe(overflow);
    await click(".review-video-poster"); await click(".dialog__close"); expect(document.activeElement).toBe(trigger);
    await click(".review-video-poster"); await navigate("/pricing"); await traverse("back");
    expect(container.querySelector("dialog")).toBeNull(); expect(document.body.style.overflow).toBe(overflow);
  });

  // 기능 : 새 공급자 수명에서는 이력 ID가 있어도 이전 메모리 선택을 재사용하지 않는지 확인한다.
  it("discards handoff memory on provider remount while retaining the URL cycle", async () => {
    await navigate("/pricing?billing=monthly"); await click('.is-recommended .pricing-bottom-cta');
    await act(async () => root.unmount()); root = createRoot(container);
    await act(async () => root.render(<App />));
    expect(container.querySelector(".plan-handoff-summary")).toBeNull();
    await traverse("back"); expect(element<HTMLInputElement>('input[value="monthly"]').checked).toBe(true);
  });
});

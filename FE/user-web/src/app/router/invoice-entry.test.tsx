import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "../app";
import { router } from "./router";

let container: HTMLDivElement;
let root: Root;
const scrollDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollIntoView");

// 기능 : 실제 앱·라우터를 연결하고 jsdom에 없는 레이아웃 기능만 대체한다.
beforeEach(async () => {
  vi.stubGlobal("matchMedia", (query: string) => ({ matches: query === "(min-width: 992px)", media: query, addEventListener() {}, removeEventListener() {} }));
  vi.stubGlobal("scrollTo", () => {});
  vi.stubGlobal("IntersectionObserver", class { observe() {} disconnect() {} unobserve() {} });
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value() {} });
  container = document.createElement("div"); document.body.append(container); root = createRoot(container);
  await router.navigate("/invoice-generator", { replace: true });
  await act(async () => root.render(<App />));
});

// 기능 : 메모리 목·타이머 수명을 종료하고 브라우저 기능 대체를 복원한다.
afterEach(async () => {
  await act(async () => root.unmount()); container.remove(); vi.unstubAllGlobals(); vi.restoreAllMocks();
  if (scrollDescriptor) Object.defineProperty(HTMLElement.prototype, "scrollIntoView", scrollDescriptor);
  else Reflect.deleteProperty(HTMLElement.prototype, "scrollIntoView");
});

// 기능 : 사용자 동작에 필요한 DOM이 없으면 해당 검증을 실패시킨다.
function element<T extends HTMLElement = HTMLElement>(selector: string): T {
  const target = container.querySelector<T>(selector);
  if (!target) throw new Error(`Missing element: ${selector}`);
  return target;
}
// 기능 : 로컬 지연과 React 상태 반영을 기다린다.
async function settle(ms = 120) { await act(async () => { await new Promise(resolve => setTimeout(resolve, ms)); }); }
// 기능 : 실제 라우터로 query·hash를 포함한 목적지에 이동한다.
async function navigate(path: string, state?: unknown) { await act(async () => router.navigate(path, { state })); }
// 기능 : 실제 DOM의 버튼·링크 이벤트를 실행한다.
async function click(selector: string) { await act(async () => element(selector).click()); }
// 기능 : 제어 입력의 네이티브 이벤트로 값 변경을 전달한다.
async function input(selector: string, value: string) {
  const target = element<HTMLInputElement | HTMLTextAreaElement>(selector);
  await act(async () => {
    const prototype = target instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(prototype, "value")!.set!.call(target, value);
    target.dispatchEvent(new Event("input", { bubbles: true }));
  });
}
// 기능 : 실제 history의 POP이 끝날 때까지 앞뒤 이동을 기다린다.
async function traverse(direction: "back" | "forward") {
  await act(async () => {
    const popped = new Promise<void>(resolve => window.addEventListener("popstate", () => resolve(), { once: true }));
    window.history[direction](); await popped;
  });
}
// 기능 : 원본 표본의 첫 행과 고객 이름을 입력한다.
async function fillInvoice(price = "10") {
  await input("#invoice-client-name", "Jane Studio");
  await input('tbody tr:nth-child(1) input[id$="-description"]', "Poster Design");
  await input('tbody tr:nth-child(1) input[id$="-quantity"]', "1");
  await input('tbody tr:nth-child(1) input[id$="-unitPrice"]', price);
}
// 기능 : 제출 이벤트를 반복 전달하여 실제 중복 방지를 검증한다.
async function submit(times = 1) {
  await act(async () => {
    for (let index = 0; index < times; index++) element(".invoice-generator").dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  });
}
// 기능 : 경로·query·hash 전체로 복귀 결과를 비교한다.
function currentUrl() { return location.pathname + location.search + location.hash; }
// 기능 : 기존 미리보기 도구에서 목 시나리오만 변경한다.
async function scenario(value: string) {
  await navigate("/components");
  await act(async () => {
    const field = element<HTMLSelectElement>(".preview-tools label:last-of-type select");
    field.value = value; field.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await navigate("/invoice-generator");
}

// 기능 : 청구 초안·계산·인계·취소·인증 연결의 사용자 결과를 실제 라우터에서 검증한다.
describe("G07 invoice generator and connected handoffs", () => {
  // 기능 : 공개 소개 진입과 뒤로·앞으로에서 편집 상태가 살아 있고 행 삭제가 다른 행을 보존하는지 확인한다.
  it("keeps stable rows and totals through introduction history and row removal", async () => {
    const origin = "/invoice-template?entry=g07#download-invoice";
    await navigate(origin); await click(".invoice-generator-link"); await fillInvoice();
    expect(element('[data-testid="invoice-subtotal"]').textContent).toBe("10.00");
    expect(element('[data-testid="invoice-tax"]').textContent).toBe("1.50");
    await click("#invoice-add-item"); await settle();
    const second = element<HTMLInputElement>('tbody tr:nth-child(2) input[id$="-description"]');
    expect(document.activeElement).toBe(second);
    expect(element('[data-testid="invoice-total"]').textContent).toBe("11.50");
    await input('tbody tr:nth-child(2) input[id$="-description"]', "긴 한국어 초안 ".repeat(15));
    await input('tbody tr:nth-child(2) input[id$="-quantity"]', "0.5"); await input('tbody tr:nth-child(2) input[id$="-unitPrice"]', "0.01");
    const stableId = second.id; const savedText = second.value;
    await click('button[aria-label="Remove item 1"]'); await settle();
    expect(element<HTMLInputElement>('tbody tr:nth-child(1) input[id$="-description"]').id).toBe(stableId);
    expect(document.activeElement?.id).toBe(stableId);
    expect(element('[data-testid="invoice-total"]').textContent).toBe("0.01");
    await traverse("back"); expect(currentUrl()).toBe(origin); await traverse("forward");
    expect(element<HTMLInputElement>('tbody tr:nth-child(1) input[id$="-description"]').value).toBe(savedText);
    await click('button[aria-label="Remove item 1"]'); await settle();
    expect(document.activeElement?.id).toBe("invoice-add-item"); await submit();
    expect(element("#invoice-issues").textContent).toContain("Add at least one");
  });

  // 기능 : 제출 snapshot과 최신 편집값을 분리하면서 가입 취소가 전체 출발 URL을 보존하는지 확인한다.
  it("cancels signup to the complete URL and latest editable draft", async () => {
    const url = "/invoice-generator?entry=invoice#draft"; await navigate(url); await fillInvoice();
    await submit(2); await settle(); expect(location.pathname).toBe("/signup");
    const signupKey = window.history.state.key;
    expect(element(".invoice-handoff-summary").textContent).toContain("11.50");
    expect(element<HTMLInputElement>("#signup-email").value).toBe("");
    expect(element('label[for="signup-email"]').textContent).toBe("Work Email");
    expect(element<HTMLInputElement>("#signup-email").placeholder).toBe("you@company.com");
    expect(JSON.stringify(window.history.state)).not.toContain("Jane Studio");
    await traverse("back"); expect(currentUrl()).toBe(url); await input('tbody tr:nth-child(1) input[id$="-unitPrice"]', "20");
    await traverse("forward"); expect(window.history.state.key).toBe(signupKey);
    expect(element(".invoice-handoff-summary").textContent).toContain("11.50");
    await click(".auth-below > .auth-secondary"); expect(currentUrl()).toBe(url);
    expect(element<HTMLInputElement>('tbody tr:nth-child(1) input[id$="-unitPrice"]').value).toBe("20");
  });

  // 기능 : 같은 생성기에서 만든 별도 가입 인계를 취소해도 이전 snapshot이 사라지지 않는지 확인한다.
  it("cancels one invoice handoff without deleting another history snapshot", async () => {
    await fillInvoice(); await submit(); await settle(); const a = window.history.state.usr.publicIntentId;
    await traverse("back"); await fillInvoice("20"); await submit(); await settle();
    expect(window.history.state.usr.publicIntentId).not.toBe(a);
    expect(element(".invoice-handoff-summary").textContent).toContain("23.00");
    await click(".auth-below > .auth-secondary");
    await click('.public-header a[href="/signup"]');
    expect(container.querySelector(".invoice-handoff-summary")).toBeNull();
    await click(".auth-below > .auth-secondary");
    await navigate("/signup", { publicIntentId: a });
    expect(element(".invoice-handoff-summary").textContent).toContain("11.50");
  });

  // 기능 : 같은 경로의 다른 이력으로 이동했을 때 이전 지연 제출이 가입 화면으로 덮지 않는지 확인한다.
  it("invalidates delayed handoff on same-path history changes", async () => {
    await scenario("slow"); await fillInvoice(); await submit();
    await navigate("/invoice-generator?entry=new-history#draft"); await settle(1550);
    expect(currentUrl()).toBe("/invoice-generator?entry=new-history#draft");
    expect(container.querySelector(".invoice-pending")).toBeNull();
    expect(element('[data-testid="invoice-total"]').textContent).toBe("11.50");
    await scenario("normal");
  });

  // 기능 : 잘못된 기한이 보존되고 초점·오류 설명이 같은 입력에 연결되는지 확인한다.
  it("links invalid due date to its error and permits correction", async () => {
    await fillInvoice(); await input("#dueDate", ""); await submit();
    const date = element<HTMLInputElement>("#dueDate"); expect(document.activeElement).toBe(date);
    expect(date.getAttribute("aria-invalid")).toBe("true");
    expect(date.getAttribute("aria-describedby")).toBe("invoice-issues");
    expect(element('[data-testid="invoice-total"]').textContent).toBe("11.50");
    await input("#dueDate", "2024-02-29"); await submit(); await settle();
    expect(element(".invoice-handoff-summary").textContent).toContain("2024-02-29");
  });

  // 기능 : 로컬 로그인 이후 선택한 행 ID·값·전체 URL을 복원하고 이력 왕복이 재복사하지 않는지 확인한다.
  it("restores only the selected invoice after login and retains its complete URL", async () => {
    const url = "/invoice-generator?entry=login#draft"; await navigate(url); await fillInvoice();
    const id = element('tbody tr:nth-child(1) input[id$="-description"]').id;
    await submit(); await settle(); await click('.auth-header a[href="/login"]');
    await click(".auth-samples button:first-of-type"); await settle(700);
    expect(element(".auth-boundary").textContent).toContain("without generating a PDF");
    await click(".auth-boundary .auth-primary"); expect(currentUrl()).toBe(url);
    expect(element('tbody tr:nth-child(1) input[id$="-description"]').id).toBe(id);
    expect(element('[data-testid="invoice-total"]').textContent).toBe("11.50");
    await input('tbody tr:nth-child(1) input[id$="-unitPrice"]', "20"); await traverse("back"); await traverse("forward");
    expect(element('[data-testid="invoice-total"]').textContent).toBe("23.00");
  });

  // 기능 : 일회 실패 뒤 같은 입력으로 재시도하고 취소·편집·화면 이탈이 지연 인계를 막는지 확인한다.
  it("preserves input on failure, retries once and cancels stale submissions", async () => {
    await scenario("write-error"); await fillInvoice(); await submit(2); await settle();
    expect(element('.invoice-generator [role="alert"]').textContent).toContain("Your invoice is still here");
    expect(element<HTMLInputElement>('#invoice-client-name').value).toBe("Jane Studio");
    await submit(); await settle(); expect(element(".invoice-handoff-summary").textContent).toContain("11.50");
    await scenario("slow"); await fillInvoice(); await submit(); await click(".invoice-pending button");
    await settle(1550); expect(location.pathname).toBe("/invoice-generator");
    await submit(); await input('tbody tr:nth-child(1) input[id$="-unitPrice"]', "30");
    await settle(1550); expect(element('[data-testid="invoice-total"]').textContent).toBe("34.50");
    await submit(); await navigate("/invoice-template"); await settle(1550);
    expect(location.pathname).toBe("/invoice-template"); await scenario("normal");
  }, 12000);

  // 기능 : 합성 IME와 종료 직후 229 Enter가 의도하지 않은 제출을 만들지 않는지 확인한다.
  it("guards composition and the IME completion Enter without blocking ordinary input", async () => {
    await fillInvoice(); const target = element("#invoice-client-name");
    await act(async () => target.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true })));
    await input("#invoice-client-name", "한글 조합 중"); await submit(); await settle();
    expect(location.pathname).toBe("/invoice-generator");
    await act(async () => target.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true })));
    const enter = new KeyboardEvent("keydown", { key: "Enter", keyCode: 229, bubbles: true, cancelable: true });
    await act(async () => target.dispatchEvent(enter)); expect(enter.defaultPrevented).toBe(true);
    await submit(); await settle(); expect(element(".invoice-handoff-summary").textContent).toContain("한글 조합 중");
  });

  // 기능 : Reset과 사용자·workspace 변경이 과거 초안·인계를 다시 노출하지 않는지 확인한다.
  it("isolates drafts on reset, account and workspace changes", async () => {
    await fillInvoice(); await submit(); await settle(); const oldIntent = window.history.state.usr.publicIntentId;
    await navigate("/components"); await click(".preview-tools button");
    expect(element<HTMLSelectElement>(".preview-tools label:last-of-type select").value).toBe("normal");
    await navigate("/signup", { publicIntentId: oldIntent }); expect(container.querySelector(".invoice-handoff-summary")).toBeNull();
    await navigate("/invoice-generator"); expect(element<HTMLInputElement>("#invoice-client-name").value).toBe("");
    await fillInvoice(); await navigate("/components");
    await select(".preview-tools label:first-of-type select", "preview-a");
    await navigate("/invoice-generator"); expect(element('[data-testid="invoice-total"]').textContent).toBe("0");
    await fillInvoice(); await navigate("/components");
    const workspace = element<HTMLSelectElement>(".preview-tools label:nth-of-type(2) select");
    const otherWorkspace = [...workspace.options].find(option => option.value !== workspace.value);
    expect(otherWorkspace).toBeDefined(); await select(".preview-tools label:nth-of-type(2) select", otherWorkspace!.value);
    await navigate("/invoice-generator"); expect(element('[data-testid="invoice-total"]').textContent).toBe("0");
    await fillInvoice(); await navigate("/components"); await select(".preview-tools label:first-of-type select", "preview-b");
    await navigate("/invoice-generator"); expect(element<HTMLInputElement>("#invoice-client-name").value).toBe("");
    await navigate("/components"); await click(".preview-tools button");
  });

  // 기능 : 직접 가입 URL과 새 메모리 마운트가 오래된 history ID에서 초안을 복구하지 않는지 확인한다.
  it("does not infer a handoff on direct signup or reuse history after memory reset", async () => {
    await fillInvoice(); await submit(); await settle(); const state = router.state.location.state;
    await navigate("/signup"); expect(container.querySelector(".invoice-handoff-summary")).toBeNull();
    expect(element('label[for="signup-email"]').textContent).toBe("Email");
    await navigate("/signup", state); expect(element(".invoice-handoff-summary").textContent).toContain("11.50");
    await act(async () => root.unmount()); root = createRoot(container); await act(async () => root.render(<App />));
    expect(container.querySelector(".invoice-handoff-summary")).toBeNull();
    await navigate("/invoice-generator"); expect(element('[data-testid="invoice-total"]').textContent).toBe("0");
  });

  // 기능 : 실제 목 가입·관찰된 온보딩 단계·명시적 인계 복귀가 같은 청구 초안을 유지하는지 확인한다.
  it("carries the selected invoice through local signup and onboarding", async () => {
    const url = "/invoice-generator?entry=signup#draft"; await navigate(url); await fillInvoice();
    await click("#invoice-add-item"); await submit(); await settle();
    await input("#signup-email", "invoice@example.test"); await input("#signup-name", "Invoice Owner");
    await input('.auth-signup input[type="password"]', "SampleOnly123!"); await click('.auth-signup input[type="checkbox"]');
    await click('.auth-signup button[type="submit"]'); await settle(900);
    expect(location.pathname).toBe("/onboarding");
    expect(element(".invoice-handoff-summary").textContent).toContain("11.50");
    await input('.setup-picker input', "Design"); await click('.setup-picker [role="option"]');
    await input("#business-name", "Invoice Studio"); await click(".setup-next");
    await select("#business-type", "Unregistered Business"); await select("#business-revenue", "RM0 - RM50,000");
    await click(".setup-next"); expect(element(".setup-missing").textContent).toContain("not recorded");
    await click(".setup-next"); await click(".setup-next"); await click(".setup-next"); await settle(500);
    expect(location.pathname).toBe("/app"); await click(".setup-dashboard-note summary");
    await click('.setup-dashboard-note a[href="/auth/continue"]');
    expect(element(".auth-boundary").textContent).toContain("11.50"); await click(".auth-boundary .auth-primary");
    expect(currentUrl()).toBe(url); expect(element('[data-testid="invoice-total"]').textContent).toBe("11.50");
    expect(container.querySelectorAll("tbody tr")).toHaveLength(1);
    expect(element<HTMLInputElement>("#invoice-client-name").value).toBe("Jane Studio");
  });
});

// 기능 : 기존 선택 컨트롤의 change 이벤트로 목 문맥과 설문 답변을 선택한다.
async function select(selector: string, value: string) {
  await act(async () => {
    const field = element<HTMLSelectElement>(selector); field.value = value;
    field.dispatchEvent(new Event("change", { bubbles: true }));
  });
}

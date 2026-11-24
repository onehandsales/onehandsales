import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "../app";
import { router } from "./router";

let container: HTMLDivElement;
let root: Root;
const password = "PreviewOnly123!";
const destination = "/app?from=setup#summary";
const query = "?returnTo=" + encodeURIComponent(destination);
const scrollDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollIntoView");
const showDescriptor = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, "showModal");
const closeDescriptor = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, "close");

// 기능 : 실제 공급자·라우터를 사용하고 jsdom에 없는 화면 API만 대체한다.
beforeEach(async () => {
  vi.stubGlobal("matchMedia", (query: string) => ({ matches: query === "(min-width: 992px)", media: query, addEventListener() {}, removeEventListener() {} }));
  vi.stubGlobal("scrollTo", () => {});
  vi.stubGlobal("IntersectionObserver", class { observe() {} disconnect() {} unobserve() {} });
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: () => {} });
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", { configurable: true, value(this: HTMLDialogElement) { this.setAttribute("open", ""); } });
  Object.defineProperty(HTMLDialogElement.prototype, "close", { configurable: true, value(this: HTMLDialogElement) { this.removeAttribute("open"); } });
  container = document.createElement("div"); document.body.append(container); root = createRoot(container);
  await router.navigate("/signup" + query, { replace: true });
  await act(async () => root.render(<App />));
});
// 기능 : 진행 요청과 메모리 공급자를 폐기해 다음 사례와 격리한다.
afterEach(async () => {
  await act(async () => root?.unmount()); container?.remove();
  for (const [prototype, name, descriptor] of [[HTMLElement.prototype, "scrollIntoView", scrollDescriptor], [HTMLDialogElement.prototype, "showModal", showDescriptor], [HTMLDialogElement.prototype, "close", closeDescriptor]] as const) {
    if (descriptor) Object.defineProperty(prototype, name, descriptor); else Reflect.deleteProperty(prototype, name);
  }
  vi.restoreAllMocks(); vi.unstubAllGlobals();
});
// 기능 : 필수 화면 요소를 찾아 없으면 해당 시나리오를 실패시킨다.
function element<T extends HTMLElement = HTMLElement>(selector: string): T {
  const target = container.querySelector<T>(selector);
  if (!target) throw new Error(`Missing element: ${selector}`);
  return target;
}
// 기능 : 제어 입력의 네이티브 이벤트로 사용자의 초안을 변경한다.
async function input(selector: string, value: string) {
  await act(async () => {
    const target = element<HTMLInputElement>(selector);
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(target, value);
    target.dispatchEvent(new Event("input", { bubbles: true }));
  });
}
// 기능 : 실제 버튼과 링크의 클릭 핸들러를 실행한다.
async function click(selector: string) { await act(async () => element(selector).click()); }
// 기능 : 목 응답의 완료를 기다리며 React 상태 반영을 포함한다.
async function settle(ms = 500) { await act(async () => { await new Promise(resolve => setTimeout(resolve, ms)); }); }
// 기능 : 실제 선택 요소의 변경 이벤트를 전달한다.
async function select(selector: string, value: string) { await act(async () => { const target = element<HTMLSelectElement>(selector); target.value = value; target.dispatchEvent(new Event("change", { bubbles: true })); }); }
// 기능 : 직접 URL 이동을 실제 앱 라우터에 전달한다.
async function navigate(path: string, state?: unknown) { await act(async () => router.navigate(path, { state })); }
// 기능 : jsdom의 history POP을 실제 라우터에 전달하고 브라우저 엔진 검증과 구분한다.
async function traverse(direction: "back" | "forward") {
  await act(async () => { const popped = new Promise<void>(resolve => window.addEventListener("popstate", () => resolve(), { once: true })); window.history[direction](); await popped; });
}
// 기능 : 가입 화면으로 새 가상 계정과 같은 작업공간을 만든다.
async function register() {
  await input("#signup-email", "setup@example.test"); await input("#signup-name", "Joe Doe");
  await input('.auth-signup input[type="password"]', password); await click(".auth-captcha input");
  await click('.auth-signup button[type="submit"]'); await settle();
  expect(location.pathname).toBe("/onboarding");
}
// 기능 : 관찰된 업종·사업 형태를 선택하고 빠진 설문 안내를 거쳐 팀 단계로 이동한다.
async function reachTeam() {
  await click('[role="combobox"]');
  const option = [...container.querySelectorAll<HTMLElement>('[role="option"]')].find(item => item.textContent === "Design")!;
  await act(async () => option.click()); await input("#business-name", "Joe Studio"); await click(".setup-next");
  await select("#business-type", "Registered / Incorporated Business");
  await select("#business-type", "Unregistered Business"); await select("#business-revenue", "RM0 - RM50,000");
  await click(".setup-next"); expect(container.textContent).toContain("One setup step is not recorded");
  expect(container.querySelectorAll(".setup-missing input")).toHaveLength(0);
  await click(".setup-next");
}
// 기능 : 팀 제안과 사용 목적을 유지한 최종 저장 단계로 진입한다.
async function reachFinal() { await reachTeam(); await input('.setup-invites input', "sample@example.test"); await click(".setup-next"); }

describe("G13 local business setup journeys", () => {
  // 기능 : 조합 중 Enter가 검색 옵션 선택이나 다음 단계 제출로 해석되지 않게 한다.
  it("does not select an industry during synthetic composition", async () => {
    await register(); await click('[role="combobox"]');
    await act(async () => element('[role="combobox"]').dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true })));
    await act(async () => element('[role="combobox"]').dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true })));
    expect(container.querySelector("#business-name")).toBeNull();
    expect(element('[role="combobox"]').getAttribute("aria-expanded")).toBe("true");
    await act(async () => element('[role="combobox"]').dispatchEvent(new CompositionEvent("compositionend", { bubbles: true })));
    await act(async () => element('[role="combobox"]').dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })));
    await input('[role="combobox"]', "not-recorded"); expect(container.textContent).toContain("No recorded option matches.");
    await act(async () => element('[role="combobox"]').dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })));
    await act(async () => element('[role="combobox"]').dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, cancelable: true })));
    expect(container.querySelectorAll('[role="option"]')).toHaveLength(12);
    await input('[role="combobox"]', "Design");
    await act(async () => element('[role="combobox"]').dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true })));
    expect(element<HTMLInputElement>('[role="combobox"]').value).toBe("Design"); expect(document.activeElement).toBe(element("#business-name"));
  });
  // 기능 : 단계 이동·뒤로·앞으로가 복귀 주소와 현재 이력의 query/hash를 보존한다.
  it("preserves the location context and draft across step navigation and pause", async () => {
    await register(); await navigate("/onboarding" + query + "&source=review#business", { reviewEntry: true });
    await click('[role="combobox"]'); await act(async () => [...container.querySelectorAll<HTMLElement>('[role="option"]')].find(item => item.textContent === "Design")!.click());
    expect(document.activeElement).toBe(element("#business-name"));
    await input("#business-name", "아주 긴 한국어 사업 이름을 입력한 조 스튜디오"); await click(".setup-next");
    expect(new URLSearchParams(location.search).get("source")).toBe("review"); expect(location.hash).toBe("#business");
    expect(router.state.location.state).toMatchObject({ reviewEntry: true });
    await traverse("back"); expect(element<HTMLInputElement>("#business-name").value).toContain("한국어");
    await traverse("forward"); expect(container.querySelector("#business-type")).not.toBeNull();
    await click('.setup-local a[href="/"]'); await traverse("back");
    expect(new URLSearchParams(location.search).get("returnTo")).toBe(destination);
    expect(container.querySelector("#business-type")).not.toBeNull();
  });
  // 기능 : Pause 뒤 명시적 대시보드 선택은 사업 초안을 유지하면서 새 복귀 목적지를 사용한다.
  it("resumes the draft with a new destination when Go to dashboard is chosen after pause", async () => {
    await register(); await reachTeam(); await input('.setup-invites input', "paused@example.test");
    await click('.setup-local a[href="/"]'); await click('.public-auth-links a[href="/app"]');
    expect(location.pathname).toBe("/onboarding"); expect(new URLSearchParams(location.search).get("returnTo")).toBe("/app");
    expect(element<HTMLInputElement>('.setup-invites input').value).toBe("paused@example.test");
    await click(".setup-next"); await click(".setup-next"); await settle();
    expect(location.pathname + location.search + location.hash).toBe("/app");
  });
  // 기능 : 무효·미방문 단계와 수정으로 무효화된 이전 답변을 정상 입력 화면으로 복구한다.
  it("normalizes invalid steps and blocks revisiting a future step with invalid earlier answers", async () => {
    await register(); await navigate("/onboarding" + query + "&step=9");
    expect(new URLSearchParams(location.search).has("step")).toBe(false);
    await reachFinal(); await navigate("/onboarding" + query + "&step=1");
    await select("#business-type", ""); await navigate("/onboarding" + query + "&step=4");
    expect(new URLSearchParams(location.search).get("step")).toBe("1");
    expect(element<HTMLSelectElement>("#business-type").value).toBe("");
  });
  // 기능 : 새 문서·익명 직접 온보딩은 유효한 내부 복귀 주소만 가입 경계에 보존한다.
  it("retains a safe destination when an anonymous user enters onboarding directly", async () => {
    await navigate("/onboarding" + query + "&step=4");
    expect(location.pathname + location.search).toBe("/signup" + query);
    await navigate("/onboarding?returnTo=https%3A%2F%2Fevil.test%2Fapp&step=4");
    expect(location.pathname).toBe("/signup"); expect(location.search).toBe("");
  });
  // 기능 : 잘못된 팀 이메일을 입력과 오류에 연결하고 초안을 유지해 수정·건너뛰기를 허용한다.
  it("announces invalid and duplicate teammate suggestions without sending invitations", async () => {
    await register(); await reachTeam();
    expect(container.querySelectorAll(".setup-invites input")).toHaveLength(3);
    await input('.setup-invites input:nth-child(1)', "invalid"); await click(".setup-next");
    expect(document.activeElement).toBe(element('.setup-invites input:nth-child(1)'));
    expect(element('.setup-invites input:nth-child(1)').getAttribute("aria-invalid")).toBe("true");
    expect(element('.setup-invites input:nth-child(1)').getAttribute("aria-describedby")).toBe("setup-error");
    await input('.setup-invites input:nth-child(1)', "SAMPLE@example.test");
    await input('.setup-invites input:nth-child(2)', "sample@example.test"); await click(".setup-next");
    expect(element("#setup-error").textContent).toContain("different");
    await input('.setup-invites input:nth-child(2)', ""); await click(".setup-next");
    expect(container.querySelectorAll('.setup-purposes input')).toHaveLength(7);
  });
  // 기능 : 저장 중 같은 경로의 새 이력은 이전 요청을 취소하고 최신 목적지로만 완료한다.
  it("cancels stale saves on same-route history changes", async () => {
    await register(); await reachFinal(); await select(".setup-local select", "slow"); await click(".setup-next");
    const nextDestination = "/app?from=latest#new";
    await navigate("/onboarding?step=4&returnTo=" + encodeURIComponent(nextDestination)); await settle(1650);
    expect(location.pathname).toBe("/onboarding"); expect(element(".setup-form").getAttribute("aria-busy")).toBe("false");
    await select(".setup-local select", "normal"); await click(".setup-next"); await settle();
    expect(location.pathname + location.search + location.hash).toBe(nextDestination);
  });
  // 기능 : 취소·일회 실패·중복 제출에서 초안과 초점을 지키고 재시도 한 번만 저장한다.
  it("preserves answers and focus on cancel and failure before a single retry", async () => {
    await register(); await reachFinal(); await select(".setup-local select", "slow"); await click(".setup-next");
    expect(document.activeElement?.textContent).toBe("Cancel saving");
    await click(".setup-cancel"); expect(document.activeElement).toBe(element(".setup-next"));
    await settle(1650); expect(location.pathname).toBe("/onboarding");
    await select(".setup-local select", "fail-once"); await click(".setup-next"); await settle();
    expect(element("#setup-error").textContent).toContain("answers are still here");
    expect(element<HTMLInputElement>('.setup-purposes input').checked).toBe(true);
    await act(async () => { element(".setup-next").click(); element(".setup-next").click(); }); await settle();
    expect(location.pathname + location.search + location.hash).toBe(destination);
    await settle(1100); expect(element(".setup-dashboard-note").textContent).toContain("Joe Studio");
  });
  // 기능 : 초기 대시보드 로딩 중 같은 경로로 이동해도 이전 타이머 취소가 영구 로딩을 남기지 않게 한다.
  it("clears initial dashboard loading after navigation to the same route", async () => {
    await register(); await reachFinal(); await click(".setup-next"); await settle();
    expect(container.querySelectorAll(".setup-loading")).toHaveLength(2);
    await navigate(destination); await settle(1100);
    expect(container.querySelectorAll(".setup-loading")).toHaveLength(0);
    expect(container.querySelector(".setup-checklist")).not.toBeNull();
    expect(container.textContent).toContain("No activity yet.");
    expect(element(".setup-dashboard-note").textContent).toContain("Joe Studio");
  });
  // 기능 : 같은 회사 저장·초기 점 로딩·빈 집계·팀 제안과 후속 회사 편집 연결을 확인한다.
  it("connects the saved company to the initial dashboard without currency conversion or fake invitations", async () => {
    await register(); await reachFinal();
    await click('.setup-purposes label:nth-child(1) input'); expect(element<HTMLButtonElement>('.setup-next').disabled).toBe(true);
    await click('.setup-purposes label:nth-child(1) input');
    await click('.setup-purposes label:nth-child(3) input'); await click('.setup-purposes label:nth-child(4) input'); await click('.setup-purposes label:nth-child(5) input');
    expect(container.querySelectorAll('.setup-purposes input:checked')).toHaveLength(4);
    await click(".setup-next"); await settle();
    expect(container.querySelectorAll(".setup-loading")).toHaveLength(2);
    expect(container.querySelectorAll(".setup-loading i")).toHaveLength(8);
    expect(element(".setup-greeting h1").textContent).toBe("Good evening, Joe.");
    await settle(1100);
    expect(container.textContent).toContain("No current activity in time frame."); expect(container.textContent).toContain("No activity yet.");
    expect(container.textContent).toContain("No tasks yet."); expect(container.textContent).toContain("USD");
    expect(element(".setup-dashboard-note").textContent).toContain("MYR");
    expect(element(".setup-dashboard-note").textContent).toContain("1 draft teammate suggestion(s), no email sent");
    const companyId = element('[data-company-id]').getAttribute("data-company-id");
    await click('.setup-checklist-detail button.setup-solid'); await settle();
    expect(element<HTMLInputElement>('#company-details-form > label input').value).toBe("Joe Studio");
    expect(element('[data-company-id]').getAttribute("data-company-id")).toBe(companyId);
    await act(async () => element('dialog').dispatchEvent(new Event("cancel", { bubbles: true, cancelable: true })));
    await click('.auth-account > button'); await click('#account-popover nav button'); await settle();
    expect(location.pathname).toBe("/login");
    await input('#login-email', "setup@example.test"); await input('#login-password', password); await click('.auth-captcha input');
    await click('.auth-login button[type="submit"]'); await settle();
    expect(location.pathname + location.search + location.hash).toBe(destination);
    expect(element('[data-company-id]').getAttribute("data-company-id")).toBe(companyId);
    expect(container.querySelector('.setup-form')).toBeNull();
    await click('.auth-account > button'); await click('#account-popover a[href="/app/settings/team"]'); await settle();
    expect(location.pathname).toBe("/app/settings/team");
    expect(container.textContent).not.toContain("sample@example.test");
  });
});

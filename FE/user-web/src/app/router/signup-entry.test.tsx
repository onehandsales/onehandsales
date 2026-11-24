import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "../app";
import { router } from "./router";

let container: HTMLDivElement;
let root: Root;
const password = "SampleOnly123!";
const originalShow = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, "showModal");
const originalClose = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, "close");

// 기능 : 실제 앱과 라우터를 사용하고 jsdom에 없는 화면 측정·네이티브 모달만 보완한다.
beforeEach(async () => {
  vi.stubGlobal("matchMedia", (query: string) => ({ matches: query === "(min-width: 992px)", media: query, addEventListener() {}, removeEventListener() {} }));
  vi.stubGlobal("scrollTo", () => {});
  vi.stubGlobal("IntersectionObserver", class { observe() {} disconnect() {} unobserve() {} });
  // 기능 : jsdom에 없는 네이티브 모달 표시만 대체하며 초점 잠금이나 실제 브라우저 검증으로 해석하지 않는다.
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", { configurable: true, value: function showModal(this: HTMLDialogElement) { this.open = true; } });
  // 기능 : 모달 닫기의 열린 속성만 동기화한다.
  Object.defineProperty(HTMLDialogElement.prototype, "close", { configurable: true, value: function close(this: HTMLDialogElement) { this.open = false; } });
  container = document.createElement("div"); document.body.append(container); root = createRoot(container);
  await router.navigate("/signup", { replace: true });
  await act(async () => root.render(<App />));
});
// 기능 : 진행 중 요청·공급자·이벤트 대체를 정리해 각 검증을 독립시킨다.
afterEach(async () => {
  await act(async () => root?.unmount()); container?.remove(); vi.restoreAllMocks(); vi.unstubAllGlobals();
  if (originalShow) Object.defineProperty(HTMLDialogElement.prototype, "showModal", originalShow); else Reflect.deleteProperty(HTMLDialogElement.prototype, "showModal");
  if (originalClose) Object.defineProperty(HTMLDialogElement.prototype, "close", originalClose); else Reflect.deleteProperty(HTMLDialogElement.prototype, "close");
});
// 기능 : 화면에 필요한 요소가 없으면 해당 흐름을 즉시 실패시킨다.
function element<T extends HTMLElement = HTMLElement>(selector: string): T {
  const target = container.querySelector<T>(selector);
  if (!target) throw new Error(`Missing element: ${selector}`);
  return target;
}
// 기능 : 제어 입력의 네이티브 값과 input 이벤트를 함께 변경한다.
async function input(selector: string, value: string) {
  await act(async () => {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
    if (!setter) throw new Error("Input setter is unavailable");
    const target = element<HTMLInputElement>(selector); setter.call(target, value);
    target.dispatchEvent(new Event("input", { bubbles: true }));
  });
}
// 기능 : 실제 링크·버튼의 이벤트를 통해 이동과 입력 처리를 실행한다.
async function click(selector: string) { await act(async () => element(selector).click()); }
// 기능 : 주소와 이력 상태를 실제 앱 라우터에 전달한다.
async function navigate(path: string, state?: unknown) { await act(async () => router.navigate(path, { state })); }
// 기능 : 실제 브라우저 이력의 POP 이벤트와 렌더링을 기다린다.
async function traverse(direction: "back" | "forward") {
  await act(async () => {
    const popped = new Promise<void>(resolve => window.addEventListener("popstate", () => resolve(), { once: true }));
    window.history[direction](); await popped;
  });
}
// 기능 : 로컬 인증 지연과 완료 이동을 기다린다.
async function settle(ms = 500) { await act(async () => { await new Promise(resolve => setTimeout(resolve, ms)); }); }
// 기능 : 가상 인증 장애 조건만 선택하고 실제 서비스를 호출하지 않는다.
async function scenario(value: string) {
  await act(async () => { const select = element<HTMLSelectElement>(".auth-tools select"); select.value = value; select.dispatchEvent(new Event("change", { bubbles: true })); });
}
// 기능 : 각 시나리오에서 동일한 표본 입력 경로를 사용한다.
async function fill(email = "signup-review@example.test", name = "검토 사용자") {
  await input("#signup-email", email); await input("#signup-name", name); await input(".auth-password input", password);
  if (!element<HTMLInputElement>(".auth-captcha input").checked) await click(".auth-captcha input");
}
// 기능 : 화면을 재조립하여 같은 URL의 새 문서에서 메모리가 초기화되는 경계를 확인한다.
async function newProvider() { await act(async () => root.unmount()); root = createRoot(container); await act(async () => root.render(<App />)); }

// 기능 : 가입 입력·오류·진행·취소와 직접 연결된 공개 인계 및 첫 사업 설정을 검증한다.
describe("G10 signup journeys", () => {
  // 기능 : 검증 오류와 비밀번호의 약함·길이·수정 상태를 분리하고 해결한 CAPTCHA 오류를 지운다.
  it("clears corrected errors and keeps password strength distinct from the length tooltip", async () => {
    await click('.auth-signup button[type="submit"]');
    expect(document.activeElement).toBe(element("#signup-email"));
    expect(element(".auth-captcha input").getAttribute("aria-invalid")).toBe("true");
    await click(".auth-captcha input");
    expect(element(".auth-captcha input").getAttribute("aria-invalid")).toBe("false");
    expect(container.querySelector(".auth-captcha-wrap .auth-error")).toBeNull();
    await input("#signup-email", "review@example.test"); await input("#signup-name", "한국어 이름");
    await input(".auth-password input", "short");
    expect(element(".auth-label-row").textContent).toContain("Too Weak");
    await act(async () => { element(".auth-password input").focus(); element("#signup-name").focus(); });
    expect(element(".auth-password-tooltip").textContent).toBe("The password must be no less than 10 characters long.");
    expect(element(".auth-label-row").textContent).not.toContain("Too Weak");
    await input(".auth-password input", password);
    expect(container.querySelector(".auth-password-tooltip")).toBeNull();
    expect(element(".auth-label-row").textContent).not.toContain("Strong");
    await act(async () => { element(".auth-password input").focus(); element("#signup-name").focus(); });
    expect(element(".auth-label-row").textContent).toContain("Strong");
    await click('.auth-password button[aria-label="Show password"]');
    expect(element<HTMLInputElement>(".auth-password input").type).toBe("text");
    await click('.auth-password button[aria-label="Hide password"]');
    expect(element<HTMLInputElement>(".auth-password input").type).toBe("password");
    expect(element<HTMLInputElement>("#signup-name").value).toBe("한국어 이름");
  });

  // 기능 : 처리 중 가려진 링크와 중복 제출을 막고 취소 뒤 같은 입력으로 다시 가입한다.
  it("locks the covered form, focuses cancellation and discards the late cancelled response", async () => {
    await fill("signup-review@example.test", "Joe Doe"); await scenario("slow");
    // 이유 : 제출 버튼에 초점이 없거나 inert 적용으로 사라져도 취소 뒤 복원 대상을 보장한다.
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    await click('.auth-signup button[type="submit"]');
    expect(element(".auth-signup form").getAttribute("aria-busy")).toBe("true");
    expect(element<HTMLFieldSetElement>(".auth-signup fieldset").disabled).toBe(true);
    expect(element<HTMLAnchorElement>(".auth-terms a").tabIndex).toBe(-1);
    expect(document.activeElement).toBe(element(".auth-progress button"));
    await click(".auth-terms a"); expect(location.pathname).toBe("/signup");
    await act(async () => { element(".auth-signup form").dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })); });
    await click(".auth-progress button"); await settle(1650);
    expect(document.activeElement).toBe(element('.auth-signup button[type="submit"]'));
    expect(location.pathname).toBe("/signup"); expect(container.querySelector(".auth-progress")).toBeNull();
    expect(element<HTMLInputElement>(".auth-password input").value).toBe(password);
    expect(element<HTMLInputElement>(".auth-captcha input").checked).toBe(true);
    await scenario("normal"); await click('.auth-signup button[type="submit"]'); await settle();
    expect(location.pathname).toBe("/onboarding");
    expect(element(".setup-form h1").textContent).toBe("Welcome, Joe.");
    expect(container.querySelectorAll('.setup-header li[aria-current="step"]')).toHaveLength(1);
    expect(element<HTMLButtonElement>(".setup-next").disabled).toBe(true);
    expect(container.querySelector("#business-name")).toBeNull();
    await navigate("/app/clients?source=signup#list");
    expect(location.pathname).toBe("/onboarding");
    expect(new URLSearchParams(location.search).get("returnTo")).toBe("/app/clients?source=signup#list");
  });

  // 기능 : 실패 한 번 이후 초안과 체크를 보존하고 정상 가입으로만 첫 설정 화면에 진입한다.
  it("preserves all input after failure and retries without forcing email verification", async () => {
    await fill(); await scenario("fail-once"); await click('.auth-signup button[type="submit"]'); await settle();
    expect(element(".auth-error-box").textContent).toContain("failed");
    expect(element<HTMLInputElement>("#signup-email").value).toBe("signup-review@example.test");
    expect(element<HTMLInputElement>("#signup-name").value).toBe("검토 사용자");
    expect(element<HTMLInputElement>(".auth-password input").value).toBe(password);
    expect(element<HTMLInputElement>(".auth-captcha input").checked).toBe(true);
    await click('.auth-signup button[type="submit"]'); await settle(); expect(location.pathname).toBe("/onboarding");
    expect(location.href + JSON.stringify(history.state) + JSON.stringify({ ...localStorage, ...sessionStorage })).not.toContain(password);
  });

  // 기능 : 약관·로그인 이력 왕복에서는 유입 이메일만 복원하고 명시적 취소는 출발 초안을 지운다.
  it("preserves the landing handoff through terms and login while clearing private form drafts", async () => {
    await navigate("/?entry=signup#trial"); await input(".public-signup-form input", "landing@example.test");
    await click(".public-signup-form button"); expect(element<HTMLInputElement>("#signup-email").value).toBe("landing@example.test");
    const intentId = router.state.location.state.publicIntentId;
    await input("#signup-name", "Private Name"); await input(".auth-password input", password); await click(".auth-captcha input");
    await click(".auth-terms a"); expect(location.pathname).toBe("/legal/terms");
    expect(element(".policy-omission").textContent).toContain("version linked during the original signup has not been confirmed");
    await traverse("back");
    expect(element<HTMLInputElement>("#signup-email").value).toBe("landing@example.test");
    expect(element<HTMLInputElement>("#signup-name").value).toBe("");
    expect(element<HTMLInputElement>(".auth-password input").value).toBe("");
    expect(element<HTMLInputElement>(".auth-captcha input").checked).toBe(false);
    await click('.auth-header a[href="/login"]'); expect(router.state.location.state.publicIntentId).toBe(intentId);
    await traverse("back"); await traverse("forward"); expect(location.pathname).toBe("/login");
    await traverse("back"); await click(".auth-below > .auth-secondary");
    expect(location.pathname + location.search + location.hash).toBe("/?entry=signup#trial");
    expect(element<HTMLInputElement>(".public-signup-form input").value).toBe("");
  });

  // 기능 : 조합 중 Enter와 합성 submit은 무시하고 조합 종료 뒤에만 가입을 처리한다.
  it("does not submit during synthetic IME composition", async () => {
    await fill("ime@example.test", "긴한국어이름".repeat(10));
    await act(async () => {
      const name = element("#signup-name"); name.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }));
      const enter = new KeyboardEvent("keydown", { key: "Enter", isComposing: true, bubbles: true, cancelable: true });
      name.dispatchEvent(enter); expect(enter.defaultPrevented).toBe(true);
      element(".auth-signup form").dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });
    expect(container.querySelector(".auth-progress")).toBeNull();
    await act(async () => { element("#signup-name").dispatchEvent(new CompositionEvent("compositionend", { bubbles: true })); });
    await click('.auth-signup button[type="submit"]'); await settle(); expect(location.pathname).toBe("/onboarding");
  });

  // 기능 : 이탈·새 공급자·Reset 뒤에는 이전 가입 응답이나 민감한 초안을 복구하지 않는다.
  it("invalidates slow submissions on exit and resets memory at a new document boundary", async () => {
    await fill(); await scenario("slow"); await click('.auth-signup button[type="submit"]');
    await navigate("/login"); await settle(1650); expect(location.pathname).toBe("/login");
    await navigate("/signup"); await fill(); await newProvider();
    expect(element<HTMLInputElement>("#signup-email").value).toBe("");
    expect(element<HTMLInputElement>(".auth-password input").value).toBe("");
    await fill(); await scenario("slow"); await click('.auth-signup button[type="submit"]');
    await navigate("/components"); await click(".preview-tools button"); await settle(1650);
    await navigate("/signup"); await fill(); await click('.auth-signup button[type="submit"]'); await settle();
    expect(location.pathname).toBe("/onboarding");
  });

  // 기능 : 가상 Google 창은 취소 때 초안을 유지하고 명시적 샘플 선택 후에만 계정을 만든다.
  it("keeps Google signup an explicit local choice and preserves input when dismissed", async () => {
    await fill(); await click(".auth-social"); expect(element("dialog").textContent).toContain("No Google account or OAuth service is opened");
    await click('.dialog__close'); expect(element<HTMLInputElement>(".auth-password input").value).toBe(password);
    await click(".auth-social"); await click("dialog .auth-primary"); await settle();
    expect(location.pathname).toBe("/onboarding"); expect(element(".setup-form h1").textContent).toBe("Welcome, Google.");
  });

  // 기능 : 명시적으로 고른 이메일 목 분기의 만료·취소·재가입·확인을 같은 입력으로 검증한다.
  it("expires and cancels the optional email challenge before a fresh successful verification", async () => {
    await fill(); await scenario("verify-email"); await click('.auth-signup button[type="submit"]'); await settle();
    expect(location.pathname).toBe("/verify-email"); expect(container.textContent).toContain("No email has been sent");
    const expire = Array.from(container.querySelectorAll<HTMLButtonElement>(".auth-boundary button")).find(button => button.textContent === "Expire sample link");
    if (!expire) throw new Error("Missing expiration control");
    await act(async () => expire.click()); expect(element<HTMLButtonElement>(".auth-boundary .auth-primary").disabled).toBe(true);
    await click('.auth-boundary > a[href="/signup"]');
    await fill(); await click('.auth-signup button[type="submit"]'); await settle();
    expect(location.pathname).toBe("/verify-email");
    await click(".auth-boundary .auth-primary"); await settle(); expect(location.pathname).toBe("/onboarding");
  });

  // 기능 : 같은 탭에서 세션을 끝내도 가상 계정은 남아 중복 이메일을 거절한다.
  it("rejects a duplicate account after ending the local session without losing corrections", async () => {
    await fill(); await click('.auth-signup button[type="submit"]'); await settle();
    await click(".setup-local > button"); expect(location.pathname).toBe("/signup");
    await fill(); await click('.auth-signup button[type="submit"]'); await settle();
    expect(element(".auth-error-box").textContent).toContain("already has");
    expect(element<HTMLInputElement>(".auth-password input").value).toBe(password);
    await input("#signup-email", "other-signup@example.test"); expect(container.querySelector(".auth-error-box")).toBeNull();
    await click('.auth-signup button[type="submit"]'); await settle(); expect(location.pathname).toBe("/onboarding");
  });
});

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "../app";
import { router } from "./router";

let container: HTMLDivElement;
let root: Root;
const password = "PreviewOnly123!";
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
  await router.navigate("/login", { replace: true });
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
// 기능 : 입력과 체크를 실제 로그인 폼에 전달한다.
async function fill(email = "alex@example.test", passwordValue = password) {
  await input("#login-email", email); await input("#login-password", passwordValue);
  if (!element<HTMLInputElement>(".auth-captcha input").checked) await click(".auth-captcha input");
}
// 기능 : 미리보기 선택 제어를 통해 실행 문맥을 변경한다.
async function choose(selector: string, value: string) {
  await act(async () => { const target = element<HTMLSelectElement>(selector); target.value = value; target.dispatchEvent(new Event("change", { bubbles: true })); });
}
// 기능 : 공급자를 다시 조립해 새 문서의 메모리 초기화 경계를 확인한다.
async function newProvider() { await act(async () => root.unmount()); root = createRoot(container); await act(async () => root.render(<App />)); }
// 기능 : 로그인 오류·취소·복귀·로그아웃 경계를 실제 앱 라우터로 검증한다.
describe("G11 login and logout journeys", () => {
  // 기능 : 잘못된 필드의 오류와 초점을 연결하고 수정한 CAPTCHA 오류만 해제한다.
  it("connects field errors and clears corrected or expired local checks", async () => {
    await click('.auth-login button[type="submit"]');
    expect(element("#login-email").getAttribute("aria-invalid")).toBe("true");
    expect(document.activeElement).toBe(element("#login-email"));
    await input("#login-email", "alex@example.test");
    await click('.auth-login button[type="submit"]');
    expect(element("#login-password").getAttribute("aria-invalid")).toBe("true");
    await input("#login-password", password); await click('.auth-login button[type="submit"]');
    expect(element(".auth-captcha input").getAttribute("aria-invalid")).toBe("true");
    expect(document.activeElement).toBe(element(".auth-captcha input"));
    await click(".auth-captcha input"); expect(container.querySelector('[role="alert"]')).toBeNull();
    await click(".auth-below > button"); expect(element(".auth-captcha input").getAttribute("aria-invalid")).toBe("true");
    await click(".auth-captcha input"); expect(container.querySelector('[role="alert"]')).toBeNull();
    expect(element<HTMLInputElement>("#login-password").type).toBe("password");
    expect(container.querySelector('.auth-login button[aria-label="Show password"]')).toBeNull();
    expect(element<HTMLInputElement>("#login-password").value).toBe(password);
  });
  // 기능 : 처리 중 취소에 초점을 두고 취소·중복 제출·늦은 결과 뒤 같은 입력으로 복귀한다.
  it("restores cancellation focus and preserves the complete protected return path", async () => {
    const destination = "/app/clients?from=login#list";
    await navigate("/login?returnTo=" + encodeURIComponent(destination));
    await fill(); await scenario("slow"); await click('.auth-login button[type="submit"]');
    expect(document.activeElement).toBe(element(".auth-cancel-login"));
    await act(async () => { element(".auth-login form").dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })); });
    await click(".auth-cancel-login"); await settle(1650);
    expect(document.activeElement).toBe(element('.auth-login button[type="submit"]'));
    expect(location.pathname).toBe("/login"); expect(element<HTMLInputElement>("#login-password").value).toBe(password);
    await scenario("normal"); await click('.auth-login button[type="submit"]'); await settle();
    expect(location.pathname + location.search + location.hash).toBe(destination);
  });
  // 기능 : 인증 메일 안내·가입·재설정 경계를 왕복해도 안전한 목적지와 선택 이력을 유지한다.
  it("preserves returnTo through the verification and reset boundaries", async () => {
    const destination = "/app/settings/company?from=login#details";
    const query = "?returnTo=" + encodeURIComponent(destination);
    await navigate("/login" + query);
    await click('.login-recovery a[href^="/verify-email/request"]');
    expect(location.search).toBe(query);
    await click('.auth-boundary a[href^="/signup"]'); expect(location.search).toBe(query);
    await click('.auth-header a[href^="/login"]');
    await click('.login-recovery a[href^="/password/reset"]'); expect(location.search).toBe(query);
    await click('a[href^="/login"]'); expect(location.search).toBe(query);
  });
  // 기능 : 계정 메뉴에 현재 workspace와 원본 여섯 행을 표시하고 실패·취소 뒤 세션을 유지한다.
  it("shows the workspace heading and signs out only after a successful local attempt", async () => {
    await fill(); await click('.auth-login button[type="submit"]'); await settle();
    await navigate("/app/clients?before=logout#list"); await navigate("/app");
    await click(".auth-account > button");
    expect(element(".auth-account-title").textContent).toBe("Studio A");
    expect(Array.from(element('nav[aria-label="Account menu"]').children, node => node.textContent)).toEqual(["Help Center", "Perks", "Team", "Subscription", "Settings", "Logout"]);
    await scenario("fail-once"); await click('nav[aria-label="Account menu"] button'); await settle();
    expect(element(".auth-account [role=alert]").textContent).toContain("failed");
    expect(location.pathname).toBe("/app");
    await scenario("slow"); await click('nav[aria-label="Account menu"] button');
    expect(document.activeElement).toBe(element(".auth-cancel-logout"));
    await click(".auth-cancel-logout"); await settle(1650);
    expect(document.activeElement).toBe(element('nav[aria-label="Account menu"] button'));
    expect(location.pathname).toBe("/app");
    await scenario("normal"); await click('nav[aria-label="Account menu"] button'); await settle();
    expect(location.pathname).toBe("/login"); expect(element<HTMLInputElement>("#login-email").value).toBe("");
    expect(element<HTMLInputElement>("#login-password").value).toBe("");
    expect(element<HTMLInputElement>(".auth-captcha input").checked).toBe(false);
    expect(container.textContent).toContain("Signed out successfully.");
    await click('[aria-label="Dismiss authentication notice"]'); expect(container.querySelector(".auth-notice")).toBeNull();
    await traverse("back"); expect(location.pathname).toBe("/login");
    await traverse("forward"); expect(location.pathname).toBe("/login");
    await navigate("/app/clients?from=logout#list"); expect(location.pathname).toBe("/login");
    await fill(); await click('.auth-login button[type="submit"]'); await settle();
    expect(location.pathname + location.search + location.hash).toBe("/app/clients?from=logout#list");
    expect(element(".auth-account > button").getAttribute("aria-label")).toBe("Alex (preview)");
  });
  // 기능 : 보호 경계가 없는 공통·공유 화면에서도 로그아웃 성공은 빈 로그인으로 연결한다.
  it.each(["/components", "/share/sample"])("returns to a blank login after signing out from %s", async path => {
    await fill(); await click('.auth-login button[type="submit"]'); await settle();
    await navigate(path); await click(".auth-account > button");
    await click('nav[aria-label="Account menu"] button'); await settle();
    expect(location.pathname).toBe("/login");
    expect(element<HTMLInputElement>("#login-email").value).toBe("");
    expect(element<HTMLInputElement>("#login-password").value).toBe("");
    expect(element<HTMLInputElement>(".auth-captcha input").checked).toBe(false);
    expect(container.textContent).toContain("Signed out successfully.");
  });
  // 기능 : 회사명은 저장 이후에만 메뉴에 반영하고 모든 직접 소비 화면에서 같은 회사를 읽는다.
  it("keeps the saved company title consistent in app, common and shared menus", async () => {
    await fill(); await click('.auth-login button[type="submit"]'); await settle();
    await navigate("/app/settings/company"); await settle();
    await input('input[aria-label="Company Name"]', "Saved review company");
    await click(".auth-account > button"); expect(element(".auth-account-title").textContent).toBe("Studio A");
    await click(".auth-account > button"); await click(".company-save"); await settle();
    for (const path of ["/app", "/components", "/share/sample"]) {
      await navigate(path); await click(".auth-account > button");
      expect(element(".auth-account-title").textContent).toBe("Saved review company");
    }
    await choose(".preview-tools label:first-of-type select", "preview-b");
    await click(".auth-account > button"); expect(element(".auth-account-title").textContent).toBe("Studio B");
  });
  // 기능 : 잘못된 비밀번호와 일회 실패 후 입력을 보존하고 조합 중 제출을 차단한다.
  it("keeps failed credentials editable and guards synthetic composition before retry", async () => {
    await fill("alex@example.test", "WrongPassword123!");
    await click('.auth-login button[type="submit"]'); await settle();
    expect(element('[role="alert"]').textContent).toContain("incorrect");
    expect(element<HTMLInputElement>("#login-password").value).toBe("WrongPassword123!");
    await input("#login-password", password); expect(container.querySelector('[role="alert"]')).toBeNull();
    await scenario("fail-once"); await click('.auth-login button[type="submit"]'); await settle();
    expect(element('[role="alert"]').textContent).toContain("failed");
    expect(element<HTMLInputElement>("#login-email").value).toBe("alex@example.test");
    expect(element<HTMLInputElement>("#login-password").value).toBe(password);
    expect(element<HTMLInputElement>(".auth-captcha input").checked).toBe(true);
    await act(async () => {
      element("#login-email").dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }));
      const enter = new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key: "Enter", isComposing: true });
      element("#login-email").dispatchEvent(enter); expect(enter.defaultPrevented).toBe(true);
      element(".auth-login form").dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });
    expect(container.querySelector(".auth-cancel-login")).toBeNull();
    await act(async () => element("#login-email").dispatchEvent(new CompositionEvent("compositionend", { bubbles: true })));
    await click('.auth-login button[type="submit"]'); await settle(); expect(location.pathname).toBe("/app");
    expect(location.href + JSON.stringify(history.state) + JSON.stringify({ ...localStorage, ...sessionStorage })).not.toContain(password);
  });
  // 기능 : 이전 로그인·로그아웃의 늦은 결과가 새 사용자나 workspace를 덮지 못하게 한다.
  it("cancels pending authentication across navigation and scope changes", async () => {
    await fill(); await scenario("slow"); await click('.auth-login button[type="submit"]');
    await click('.login-recovery a[href^="/password/reset"]'); await settle(1650);
    expect(location.pathname).toBe("/password/reset");
    await navigate("/login"); await scenario("normal"); await fill(); await click('.auth-login button[type="submit"]'); await settle();
    await click(".auth-account > button"); await scenario("slow"); await click('nav[aria-label="Account menu"] button');
    await choose(".preview-tools label:nth-of-type(2) select", "studio-a-two");
    expect(container.querySelector(".auth-account-popover")).toBeNull();
    await choose(".preview-tools label:first-of-type select", "preview-b"); await settle(1650);
    expect(location.pathname).toBe("/app");
    expect(element(".auth-account > button").getAttribute("aria-label")).toBe("Blair (preview)");
    await click(".auth-account > button"); expect(element(".auth-account-title").textContent).toBe("Studio B");
    await act(async () => document.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "Escape" })));
    expect(container.querySelector(".auth-account-popover")).toBeNull();
    expect(document.activeElement).toBe(element(".auth-account > button"));
    await click(".auth-account > button"); await act(async () => document.body.dispatchEvent(new Event("pointerdown", { bubbles: true })));
    expect(container.querySelector(".auth-account-popover")).toBeNull();
  });
  // 기능 : 다른 공개 초안과 분리된 선택 하나만 인증 뒤 전달하고 다른 사용자에게 재사용하지 않는다.
  it("transfers only the selected public intent and invalidates it on a different session", async () => {
    await navigate("/?entry=first#trial"); await input(".public-signup-form input", "first@example.test"); await click(".public-signup-form button");
    const selected = router.state.location.state.publicIntentId;
    await navigate("/?entry=second#trial"); await input(".public-signup-form input", "second@example.test"); await click(".public-signup-form button");
    await navigate("/login", { publicIntentId: selected });
    expect(element<HTMLInputElement>("#login-email").value).toBe("first@example.test");
    await fill(); await click('.auth-login button[type="submit"]'); await settle();
    expect(location.pathname).toBe("/auth/continue"); expect(element(".auth-intent").textContent).toContain("first@example.test");
    expect(element(".auth-intent").textContent).not.toContain("second@example.test");
    await click(".auth-boundary .auth-secondary"); expect(location.pathname + location.search + location.hash).toBe("/?entry=first#trial");
    await navigate("/app"); await choose(".preview-tools label:first-of-type select", "preview-b");
    await navigate("/auth/continue"); expect(container.querySelector(".auth-intent")).toBeNull();
    expect(container.textContent).toContain("This selection is unavailable");
  });
  // 기능 : 소셜 모달을 여는 것만으로 인증하지 않고 명시한 로컬 계정으로만 진입한다.
  it.each([['google', 'Alex (preview)'], ['apple', 'Blair (preview)']])("requires explicit %s identity confirmation", async (method, name) => {
    await input("#login-email", "draft@example.test");
    const selector = method === "google" ? ".login-socials button:first-child" : ".login-socials button:last-child";
    await act(async () => element(selector).focus()); await click(selector);
    expect(location.pathname).toBe("/login"); expect(element("dialog").textContent).toContain("No OAuth provider is contacted");
    await click('dialog [aria-label="Close dialog"]'); expect(document.activeElement).toBe(element(selector));
    expect(element<HTMLInputElement>("#login-email").value).toBe("draft@example.test");
    await click(selector); await click("dialog .auth-primary"); await settle();
    expect(location.pathname).toBe("/app"); expect(element(".auth-account > button").getAttribute("aria-label")).toBe(name);
  });
  // 기능 : 명시적으로 선택한 2FA의 실패·만료·재발급·취소를 실제 라우터 경계에서 확인한다.
  it("keeps optional two-factor confirmation local and preserves its intended destination", async () => {
    const target = "/app/clients?via=factor#list";
    await navigate("/login?returnTo=" + encodeURIComponent(target)); await fill(); await scenario("two-factor");
    await click('.auth-login button[type="submit"]'); await settle(); expect(location.pathname).toBe("/two-factor");
    await input("#factor-code", "000000"); await click('button[type="submit"]'); await settle();
    expect(element('[role="alert"]').textContent).toContain("Incorrect");
    await click(".auth-boundary > button:last-of-type"); expect(element<HTMLInputElement>("#factor-code").disabled).toBe(true);
    await click(".auth-boundary > button:first-of-type"); expect(element<HTMLInputElement>("#factor-code").value).toBe("");
    await click('.auth-boundary a[href^="/login"]'); expect(new URLSearchParams(location.search).get("returnTo")).toBe(target);
    await traverse("back"); expect(container.textContent).toContain("This local challenge is unavailable");
    await navigate("/login?returnTo=" + encodeURIComponent(target)); await fill(); await click('.auth-login button[type="submit"]'); await settle();
    await input("#factor-code", "123456"); await click('button[type="submit"]'); await settle();
    expect(location.pathname + location.search + location.hash).toBe(target);
  });
  // 기능 : 새 문서에서는 세션을 버리고 외부 복귀 주소를 차단하며 미완료 설정 계정은 설정으로 돌린다.
  it("handles a new provider, unsafe destinations and a newly registered unfinished account", async () => {
    await navigate("/login?returnTo=" + encodeURIComponent("//outside.test/app"));
    await fill(); await click('.auth-login button[type="submit"]'); await settle(); expect(location.pathname).toBe("/app");
    await newProvider(); expect(location.pathname).toBe("/login");
    const target = "/app/clients?new=account#list";
    await navigate("/signup?returnTo=" + encodeURIComponent(target));
    await input("#signup-email", "new-login@example.test"); await input("#signup-name", "한국어 이름"); await input(".auth-password input", password); await click(".auth-captcha input");
    await click('.auth-signup button[type="submit"]'); await settle(); expect(location.pathname).toBe("/onboarding");
    await navigate("/components"); await choose(".preview-tools label:first-of-type select", "guest");
    await navigate("/login?returnTo=" + encodeURIComponent(target)); await fill("new-login@example.test"); await click('.auth-login button[type="submit"]'); await settle();
    expect(location.pathname).toBe("/onboarding"); expect(new URLSearchParams(location.search).get("returnTo")).toBe(target);
    expect(element(".setup-form h1").textContent).toBe("Welcome, 한국어.");
  });
});

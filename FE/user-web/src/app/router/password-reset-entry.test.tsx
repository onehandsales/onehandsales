import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "../app";
import { router } from "./router";

let container: HTMLDivElement;
let root: Root;
const oldPassword = "PreviewOnly123!";
const newPassword = "Replacement123!";
const destination = "/app/clients?from=reset#list";
const query = "?returnTo=" + encodeURIComponent(destination);

// 기능 : 실제 앱 공급자와 라우터를 독립적으로 조립하고 jsdom에 없는 화면 API만 보완한다.
beforeEach(async () => {
  vi.stubGlobal("matchMedia", (query: string) => ({ matches: query === "(min-width: 992px)", media: query, addEventListener() {}, removeEventListener() {} }));
  vi.stubGlobal("scrollTo", () => {});
  vi.stubGlobal("IntersectionObserver", class { observe() {} disconnect() {} unobserve() {} });
  container = document.createElement("div"); document.body.append(container); root = createRoot(container);
  await router.navigate("/login" + query, { replace: true });
  await act(async () => root.render(<App />));
});
// 기능 : 폼·메모리 저장소·진행 요청을 정리해 다음 시나리오에 상태를 넘기지 않는다.
afterEach(async () => { await act(async () => root.unmount()); container.remove(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
// 기능 : 필요한 화면 요소의 존재를 검증하고 접근할 수 있는 DOM을 반환한다.
function element<T extends HTMLElement = HTMLElement>(selector: string): T {
  const target = container.querySelector<T>(selector);
  if (!target) throw new Error(`Missing element: ${selector}`);
  return target;
}
// 기능 : 네이티브 입력 이벤트로 제어 폼의 초안을 변경한다.
async function input(selector: string, value: string) {
  await act(async () => {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
    if (!setter) throw new Error("Input setter unavailable");
    const target = element<HTMLInputElement>(selector); setter.call(target, value); target.dispatchEvent(new Event("input", { bubbles: true }));
  });
}
// 기능 : 실제 링크나 버튼을 눌러 앱의 사용자 이벤트와 라우팅을 실행한다.
async function click(selector: string) { await act(async () => element(selector).click()); }
// 기능 : 실제 앱 라우터에 직접 경로와 비밀 없는 이력 상태를 전달한다.
async function navigate(path: string, state?: unknown) { await act(async () => router.navigate(path, { state })); }
// 기능 : 취소 가능한 목 지연의 완료까지 React 상태 갱신을 기다린다.
async function settle(ms = 500) { await act(async () => { await new Promise(resolve => setTimeout(resolve, ms)); }); }
// 기능 : 인증 목 도구에서 지연·실패 조건을 명시적으로 선택한다.
async function scenario(value: string) { await act(async () => { const select = element<HTMLSelectElement>(".auth-tools select"); select.value = value; select.dispatchEvent(new Event("change", { bubbles: true })); }); }
// 기능 : 정상 복구 요청에서 안내와 유효한 로컬 링크를 구분해 새 비밀번호 화면에 진입한다.
async function openReset(email = "alex@example.test") {
  await navigate("/password/reset" + query); await input("#reset-email", email); await click(".auth-captcha input");
  await click('.auth-reset button[type="submit"]'); await settle(); await click('a[href^="/password/new"]');
}
// 기능 : 같은 가상 계정을 로그인 폼으로 인증하고 실제 앱 이동을 기다린다.
async function login(password: string, email = "alex@example.test") {
  await input("#login-email", email); await input("#login-password", password);
  if (!element<HTMLInputElement>(".auth-captcha input").checked) await click(".auth-captcha input");
  await click('.auth-login button[type="submit"]'); await settle();
}
// 기능 : jsdom의 이력 POP을 실제 라우터에 전달하며 브라우저 엔진 검증과 구분한다.
async function traverse(direction: "back" | "forward") {
  await act(async () => { const popped = new Promise<void>(resolve => window.addEventListener("popstate", () => resolve(), { once: true })); window.history[direction](); await popped; });
}

describe("G12 password reset journeys", () => {
  // 기능 : 같은 요청 화면의 이력이 바뀌면 이전 복귀 문맥에서 시작한 발송 안내를 반영하지 않는다.
  it("cancels a pending reset request when the same route receives a new history entry", async () => {
    await navigate("/password/reset" + query); await input("#reset-email", "alex@example.test"); await click(".auth-captcha input");
    await scenario("slow"); await click('.auth-reset button[type="submit"]');
    const nextQuery = "?returnTo=" + encodeURIComponent("/app/projects?from=latest#items");
    await navigate("/password/reset" + nextQuery, { publicIntentId: "new-selection" });
    await settle(1650);
    expect(location.pathname + location.search).toBe("/password/reset" + nextQuery);
    expect(container.querySelector(".auth-reset-message")).toBeNull();
    expect(element<HTMLInputElement>("#reset-email").value).toBe("alex@example.test");
    expect(element(".auth-reset form").getAttribute("aria-busy")).toBe("false");
    await scenario("normal"); await click('.auth-reset button[type="submit"]'); await settle();
    expect(element<HTMLAnchorElement>('a[href^="/password/new"]').getAttribute("href")).toBe("/password/new" + nextQuery);
  });
  // 기능 : 저장 중 같은 링크의 복귀 문맥을 바꾸면 이전 저장을 취소하고 새 제출만 현재 목적지로 돌려준다.
  it("cancels a pending password save when the return context changes on the same route", async () => {
    await openReset(); const linkState = router.state.location.state; await input("#new-password", newPassword);
    await scenario("slow"); await click('.auth-reset button[type="submit"]');
    const nextDestination = "/app/projects?from=latest#items"; const nextQuery = "?returnTo=" + encodeURIComponent(nextDestination);
    await navigate("/password/new" + nextQuery, linkState); await settle(1650);
    expect(location.pathname + location.search).toBe("/password/new" + nextQuery);
    expect(element<HTMLInputElement>("#new-password").value).toBe(newPassword);
    expect(element(".auth-reset form").getAttribute("aria-busy")).toBe("false");
    await scenario("normal"); await click('.auth-reset button[type="submit"]'); await settle();
    expect(location.pathname + location.search).toBe("/login" + nextQuery);
    await login(newPassword); expect(location.pathname + location.search + location.hash).toBe(nextDestination);
  });
  // 기능 : 설정 미완료 계정은 비밀번호 재설정 뒤에도 같은 계정의 온보딩으로 복귀한다.
  it("retains the unfinished account setup boundary after reset", async () => {
    await navigate("/signup" + query); await input("#signup-email", "reset-new@example.test");
    await input("#signup-name", "새 계정 재설정 검토"); await input('.auth-signup input[type="password"]', oldPassword);
    await click(".auth-captcha input"); await click('.auth-signup button[type="submit"]'); await settle();
    expect(location.pathname).toBe("/onboarding");
    await openReset("reset-new@example.test"); await input("#new-password", newPassword);
    await click('.auth-reset button[type="submit"]'); await settle(); expect(location.pathname).toBe("/login");
    await navigate(destination); expect(location.pathname).toBe("/login");
    await login(newPassword, "reset-new@example.test"); expect(location.pathname).toBe("/onboarding"); expect(location.search).toBe(query);
  });
  // 기능 : 빈 이메일·CAPTCHA 오류를 해당 입력과 연결하고 수정한 오류만 해제한다.
  it("associates invalid fields with errors and focuses the corrected local check", async () => {
    await click('.login-recovery a[href^="/password/reset"]');
    await click('.auth-reset button[type="submit"]');
    expect(element("#reset-email").getAttribute("aria-invalid")).toBe("true");
    expect(document.activeElement).toBe(element("#reset-email"));
    await input("#reset-email", "invalid"); await click('.auth-reset button[type="submit"]');
    expect(element('[role="alert"]').textContent).toContain("valid email");
    await input("#reset-email", "alex@example.test"); await click('.auth-reset button[type="submit"]');
    expect(document.activeElement).toBe(element(".auth-captcha input"));
    expect(element(".auth-captcha input").getAttribute("aria-invalid")).toBe("true");
    await click(".auth-captcha input"); expect(container.querySelector('[role="alert"]')).toBeNull();
  });
  // 기능 : 두 복구 화면의 인증 메일 안내를 실제 재설정 재발송과 분리하고 복귀 목적지를 보존한다.
  it("keeps returnTo across verification detours from both reset screens", async () => {
    await navigate("/password/reset" + query); await click(".auth-reset-verification");
    expect(location.pathname).toBe("/verify-email/request"); expect(location.search).toBe(query);
    await click('main a[href^="/login"]'); expect(location.search).toBe(query);
    await openReset(); await click(".auth-reset-verification"); expect(location.search).toBe(query);
    await traverse("back"); expect(location.pathname).toBe("/password/new"); expect(container.querySelector("#new-password")).toBeNull();
  });
  // 기능 : 요청 취소는 초안과 초점을 복원하고 없는 계정에는 유효한 링크를 만들지 않는다.
  it("cancels pending requests without a late receipt and retains input after failure", async () => {
    await navigate("/password/reset"); await input("#reset-email", "unknown@example.test"); await click(".auth-captcha input");
    await scenario("slow"); await click('.auth-reset button[type="submit"]');
    expect(document.activeElement?.textContent).toBe("Cancel request");
    await click(".auth-reset-controls > button"); expect(document.activeElement).toBe(element('.auth-reset button[type="submit"]'));
    await settle(1650); expect(container.querySelector(".auth-reset-message")).toBeNull();
    await scenario("fail-once"); await click('.auth-reset button[type="submit"]'); await settle();
    expect(element<HTMLInputElement>("#reset-email").value).toBe("unknown@example.test");
    expect(container.textContent).toContain("failed");
    await click('.auth-reset button[type="submit"]'); await settle();
    expect(container.querySelector("#reset-email")).toBeNull(); expect(container.querySelector('a[href^="/password/new"]')).toBeNull();
    expect(element(".auth-reset-message").textContent).toContain("We've sent you an email");
    expect(container.textContent).toContain("no email");
    await navigate("/login"); await login(oldPassword, "unknown@example.test"); expect(location.pathname).toBe("/login");
  });
  // 기능 : 약한 입력만 비우고 재입력 중 오류를 유지하며 성공 뒤 같은 ID와 새 암호로만 로그인한다.
  it("preserves source weak-password states then returns to blank login without authenticating", async () => {
    await openReset(); const usedState = router.state.location.state;
    expect(container.querySelectorAll('.auth-reset input[type="password"]')).toHaveLength(1);
    await input("#new-password", "weak"); await click('.auth-reset button[type="submit"]'); await settle();
    expect(element<HTMLInputElement>("#new-password").value).toBe(""); expect(document.activeElement).toBe(element("#new-password"));
    expect(element(".auth-reset-error").textContent).toBe("Whoops!Password is too weak");
    await input("#new-password", newPassword); expect(element(".auth-reset-error").textContent).toContain("too weak");
    await click('.auth-reset button[type="submit"]'); await settle();
    expect(location.pathname + location.search).toBe("/login" + query);
    expect(element<HTMLInputElement>("#login-email").value).toBe(""); expect(element<HTMLInputElement>("#login-password").value).toBe("");
    expect(element<HTMLInputElement>(".auth-captcha input").checked).toBe(false);
    expect(container.textContent).toContain("Your new password has been set successfully.");
    expect(container.textContent).toContain("New Collaborators project view");
    expect(location.href + JSON.stringify(history.state) + JSON.stringify({ ...localStorage, ...sessionStorage })).not.toContain(newPassword);
    await navigate("/password/new" + query, usedState); expect(container.querySelector("#new-password")).toBeNull();
    await navigate("/login" + query); await login(oldPassword); expect(container.textContent).toContain("incorrect");
    await login(newPassword); expect(location.pathname + location.search + location.hash).toBe(destination);
    expect(element(".auth-account > button").getAttribute("aria-label")).toBe("Alex (preview)");
  });
  // 기능 : 일반 실패·취소는 새 암호를 보존하고 중복·조합 제출과 이탈 뒤 지연 저장을 막는다.
  it("retains failed drafts, cancels saves and blocks duplicate or composing submissions", async () => {
    await openReset(); await input("#new-password", newPassword); await scenario("fail-once");
    await click('.auth-reset button[type="submit"]'); await settle();
    expect(element<HTMLInputElement>("#new-password").value).toBe(newPassword); expect(container.textContent).toContain("failed");
    await scenario("slow"); await click('.auth-reset button[type="submit"]');
    expect(document.activeElement?.textContent).toBe("Cancel password change"); await click(".auth-reset-controls > button");
    expect(document.activeElement).toBe(element('.auth-reset button[type="submit"]')); expect(element<HTMLInputElement>("#new-password").value).toBe(newPassword);
    await act(async () => {
      element("#new-password").dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }));
      const enter = new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key: "Enter", isComposing: true });
      element("#new-password").dispatchEvent(enter); expect(enter.defaultPrevented).toBe(true);
      element(".auth-reset form").dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });
    expect(element(".auth-reset form").getAttribute("aria-busy")).toBe("false");
    await act(async () => element("#new-password").dispatchEvent(new CompositionEvent("compositionend", { bubbles: true })));
    await click('.auth-reset button[type="submit"]');
    await act(async () => element(".auth-reset form").dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })));
    await click('.auth-reset-controls a[href^="/login"]'); await settle(1650); await scenario("normal");
    await login(oldPassword); expect(location.pathname + location.search + location.hash).toBe(destination);
  });
  // 기능 : 같은 페이지에서 링크 대상이 바뀌면 이전 비밀번호 초안이 다시 나타나지 않는다.
  it("clears a secret draft when the history link identity changes", async () => {
    await openReset(); const original = router.state.location.state; await input("#new-password", newPassword);
    await navigate("/password/new" + query, { resetChallengeId: "unavailable" });
    expect(container.querySelector("#new-password")).toBeNull();
    await navigate("/password/new" + query, original);
    expect(element<HTMLInputElement>("#new-password").value).toBe("");
  });
  // 기능 : 직접 진입·만료·교체·새 공급자의 사용할 수 없는 링크를 새 요청 경로로 복구한다.
  it("recovers missing, expired, replaced and new-provider links without restoring secrets", async () => {
    await navigate("/password/new" + query); expect(container.querySelector("#new-password")).toBeNull();
    await click('.auth-reset a[href^="/password/reset"]'); expect(location.search).toBe(query);
    await openReset(); const original = router.state.location.state;
    await click(".auth-reset-controls > button"); expect(container.querySelector("#new-password")).toBeNull();
    await click('.auth-reset a[href^="/password/reset"]'); await click(".auth-reset-controls > button");
    await click(".auth-captcha input"); await click('.auth-reset button[type="submit"]'); await settle();
    await click('a[href^="/password/new"]'); const replacement = router.state.location.state;
    expect(replacement.resetChallengeId).not.toBe(original.resetChallengeId);
    await navigate("/password/new" + query, original); expect(container.querySelector("#new-password")).toBeNull();
    await navigate("/password/new" + query, replacement);
    await act(async () => root.unmount()); root = createRoot(container); await act(async () => root.render(<App />));
    expect(container.querySelector("#new-password")).toBeNull();
    await navigate("/login"); await login(oldPassword); expect(location.pathname).toBe("/app");
  });
  // 기능 : 선택한 공개 인계만 복구 성공 뒤 유지하고 빈 로그인과 별도의 요약으로 전달한다.
  it("preserves only the selected public intent through reset and reauthentication", async () => {
    await navigate("/?entry=first#trial"); await input(".public-signup-form input", "first@example.test"); await click(".public-signup-form button");
    const selected = router.state.location.state.publicIntentId;
    await navigate("/?entry=second#trial"); await input(".public-signup-form input", "second@example.test"); await click(".public-signup-form button");
    await navigate("/login" + query, { publicIntentId: selected }); await click('.login-recovery a[href^="/password/reset"]');
    await input("#reset-email", "alex@example.test"); await click(".auth-captcha input"); await click('.auth-reset button[type="submit"]'); await settle();
    await click('a[href^="/password/new"]'); await input("#new-password", newPassword); await click('.auth-reset button[type="submit"]'); await settle();
    expect(element<HTMLInputElement>("#login-email").value).toBe(""); await login(newPassword);
    expect(location.pathname).toBe("/auth/continue"); expect(element(".auth-intent").textContent).toContain("first@example.test");
    expect(element(".auth-intent").textContent).not.toContain("second@example.test");
    await click(".auth-boundary .auth-secondary"); expect(location.pathname + location.search + location.hash).toBe("/?entry=first#trial");
  });
});

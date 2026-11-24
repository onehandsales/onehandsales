import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "../app";
import { router } from "./router";

let container: HTMLDivElement;
let root: Root;

// 기능 : 실제 앱·라우터·메모리 공급자를 조립하고 jsdom의 미지원 화면 측정만 대체한다.
beforeEach(async () => {
  vi.stubGlobal("matchMedia", (query: string) => ({ matches: query === "(min-width: 992px)", media: query, addEventListener() {}, removeEventListener() {} }));
  vi.stubGlobal("scrollTo", () => {});
  vi.stubGlobal("IntersectionObserver", class { observe() {} disconnect() {} unobserve() {} });
  container = document.createElement("div"); document.body.append(container); root = createRoot(container);
  await router.navigate("/affiliates", { replace: true });
  await act(async () => root.render(<App />));
});
// 기능 : 각 검증의 공급자·구독과 DOM을 정리해 목 상태를 다음 검증과 분리한다.
afterEach(async () => { await act(async () => root.unmount()); container.remove(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });
// 기능 : 필요한 화면 요소가 없으면 해당 시나리오를 실패시킨다.
function element<T extends HTMLElement = HTMLElement>(selector: string): T {
  const target = container.querySelector<T>(selector);
  if (!target) throw new Error(`Missing element: ${selector}`);
  return target;
}
// 기능 : 실제 라우터에 주소와 선택적인 이력 상태를 전달한다.
async function navigate(path: string, state?: unknown) { await act(async () => router.navigate(path, { state })); }
// 기능 : 실제 링크나 버튼의 클릭 처리와 React 반영을 기다린다.
async function click(selector: string) { await act(async () => element(selector).click()); }
// 기능 : 실제 브라우저 이력 API의 POP 이벤트를 기다려 이동 결과를 검사한다.
async function traverse(direction: "back" | "forward") {
  await act(async () => {
    const popped = new Promise<void>(resolve => window.addEventListener("popstate", () => resolve(), { once: true }));
    window.history[direction](); await popped;
  });
}
// 기능 : 복귀 버튼이 시작한 실제 이력 이동과 렌더링을 기다린다.
async function returnToSource() { await click(".company-outbound button"); await settle(); }
// 기능 : 로컬 비동기 상태와 POP 렌더링이 반영될 시간을 제공한다.
async function settle() { await act(async () => { await new Promise(resolve => setTimeout(resolve, 130)); }); }
// 기능 : 복귀 결과에 검색 조건과 문서 위치가 함께 남는지 비교한다.
function currentUrl() { return location.pathname + location.search + location.hash; }
// 기능 : 제어 입력의 네이티브 변경 이벤트를 전달한다.
async function input(selector: string, value: string) {
  await act(async () => {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
    if (!setter) throw new Error("Input setter is unavailable");
    const target = element<HTMLInputElement>(selector); setter.call(target, value);
    target.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

// 기능 : 공개 회사 소개와 정책 읽기·로컬 목적지·직접 연결된 인증 복귀를 검증한다.
describe("G09 company and historical policy journeys", () => {
  // 기능 : 정적 소개를 실제 폼이나 지급 상태로 바꾸지 않고 관찰된 카드와 서로 다른 사진을 유지한다.
  it("keeps affiliate illustrations and career benefits as static historical content", async () => {
    expect(container.querySelectorAll(".affiliate-benefits article")).toHaveLength(6);
    expect(container.querySelectorAll(".affiliate-steps-grid h3")).toHaveLength(3);
    expect(element(".affiliate-content").textContent).toContain("200% CPA");
    expect(element(".affiliate-content").textContent).toContain("30% CPA");
    expect(element(".affiliate-benefits").textContent).toContain("Business yearly: $200");
    expect(container.querySelector(".affiliate-content input, .affiliate-content form")).toBeNull();
    await navigate("/careers");
    expect(container.querySelectorAll(".careers-benefits article")).toHaveLength(6);
    expect(container.querySelectorAll(".careers-values article")).toHaveLength(3);
    const photos = Array.from(container.querySelectorAll<HTMLImageElement>(".careers-group"));
    expect(photos).toHaveLength(2); expect(photos[0]?.src).not.toBe(photos[1]?.src);
    expect(element(".company-history-note").textContent).toContain("not current job openings");
  });

  // 기능 : 정책의 보이는 문단·마지막 목록 항목을 보존하고 발췌와 날짜의 의미를 구분한다.
  it("preserves the visible privacy fragment and every request item without inventing the missing policy", async () => {
    await navigate("/legal/privacy");
    const items = Array.from(container.querySelectorAll(".policy-request-items li"), item => item.textContent);
    expect(items).toHaveLength(5); expect(items.at(-1)).toBe("- What processes are using this information");
    expect(element(".policy-copy").textContent).toContain("In particular, Bonsai offers a Google");
    expect(element(".policy-omission").textContent).toContain("not the complete legal document");
    expect(container.querySelectorAll('.privacy-bottom a[href="/outbound/cookie-policy"]')).toHaveLength(1);
    await click('.policy-links a[href="/legal/terms"]');
    expect(element(".policy-copy").textContent).toContain("Last Updated: June 30, 2020");
    expect(element(".policy-copy").textContent).toContain("not a verified effective date");
    expect(container.querySelector(".policy-copy form, .policy-copy input")).toBeNull();
    await traverse("back"); expect(location.pathname).toBe("/legal/privacy");
  });

  // 기능 : 제휴·채용·정책 CTA의 모든 등록 목적지가 정확한 출발 URL과 이력 상태로 돌아가게 한다.
  it("returns each company CTA to its exact source entry and supports forward and repeat visits", async () => {
    for (const [path, selector, id] of [
      ["/affiliates", ".affiliate-hero a", "affiliate-application"],
      ["/affiliates", ".affiliate-steps-grid a", "affiliate-application"],
      ["/affiliates", ".affiliate-join a:first-child", "affiliate-application"],
      ["/affiliates", ".affiliate-join a:last-child", "affiliate-contact"],
      ["/careers", ".careers-copy a", "careers"],
      ["/legal/privacy", ".privacy-bottom a", "cookie-policy"],
      ["/legal/privacy", '.policy-links a[href="/outbound/privacy-contact"]', "privacy-contact"],
    ] as const) {
      const origin = path + "?entry=company#reading"; const state = { reading: id };
      await navigate(origin, state); const key = router.state.location.key;
      await click(selector); expect(location.pathname).toBe("/outbound/" + id);
      expect(router.state.location.state.companyOrigin).toBe(origin);
      expect(container.querySelector('.company-outbound a[href^="http"], .company-outbound a[href^="mailto:"]')).toBeNull();
      await returnToSource(); expect(currentUrl()).toBe(origin);
      expect(router.state.location.key).toBe(key); expect(router.state.location.state).toEqual(state);
      await traverse("forward"); expect(location.pathname).toBe("/outbound/" + id);
      await returnToSource(); expect(currentUrl()).toBe(origin);
    }
  });

  // 기능 : 중간에 다른 화면을 방문해도 단순 한 단계 뒤가 아닌 원래 이력으로 복귀한다.
  it("returns past intervening entries and rejects a replaced source entry", async () => {
    const origin = "/careers?source=original#values";
    await navigate(origin); const originalKey = router.state.location.key;
    await click(".careers-copy a"); const outboundState = router.state.location.state;
    await navigate("/legal/privacy"); await navigate("/outbound/careers", outboundState);
    await returnToSource(); expect(currentUrl()).toBe(origin); expect(router.state.location.key).toBe(originalKey);
    await act(async () => router.navigate("/reviews?replacement=yes", { replace: true }));
    await navigate("/outbound/careers", outboundState); await returnToSource();
    expect(currentUrl()).toBe("/careers");
  });

  // 기능 : 소셜 링크 소비 화면의 공개 이메일·검색·문서 위치를 같은 출발 이력에서 보존한다.
  it("preserves footer origins across public consumers and keeps the email draft", async () => {
    await navigate("/?entry=email#trial"); await input(".public-signup-form input", "company-reader@example.test");
    for (const path of ["/?entry=email#trial", "/blog?q=invoice#results", "/templates?search=invoice#catalog", "/support?entry=footer#channels", "/legal/terms?entry=footer#terms"]) {
      for (const id of ["linkedin", "twitter"]) {
        await navigate(path); await click(`.public-footer a[href="/outbound/${id}"]`);
        expect(router.state.location.state.companyOrigin).toBe(path);
        await returnToSource(); expect(currentUrl()).toBe(path);
      }
    }
    await navigate("/"); expect(element<HTMLInputElement>(".public-signup-form input").value).toBe("company-reader@example.test");
  });

  // 기능 : 직접 진입·위조된 이전 상태·재초기화 이력은 확인된 기본 경로로만 복귀한다.
  it("uses safe fallbacks for direct entries, stale state and a fresh provider", async () => {
    await navigate("/outbound/affiliate-application", { companyOrigin: "//outside.invalid", companyOriginKey: "old" });
    await returnToSource(); expect(currentUrl()).toBe("/affiliates");
    await navigate("/outbound/cookie-policy"); await returnToSource(); expect(currentUrl()).toBe("/legal/privacy");
    await navigate("/careers?entry=before-reload#benefits"); await click(".careers-copy a");
    await act(async () => root.unmount()); root = createRoot(container); await act(async () => root.render(<App />));
    expect(location.pathname).toBe("/outbound/careers"); await returnToSource(); expect(currentUrl()).toBe("/careers");
    await navigate("/outbound/not-a-destination"); expect(container.textContent).toContain("does not exist");
    await click('a[href="/"]'); expect(location.pathname).toBe("/");
  });

  // 기능 : 회사 페이지와 외부 안내에서 가입 취소 후에도 원래 URL과 중첩 출발 정보를 보존한다.
  it("preserves company URLs and the outbound return chain through signup cancellation", async () => {
    await navigate("/careers?entry=signup#values"); await click('.public-auth-links a[href="/signup"]');
    await click(".auth-below > .auth-secondary"); expect(currentUrl()).toBe("/careers?entry=signup#values");
    await navigate("/blog?q=company#results"); const key = router.state.location.key;
    await click('.public-footer a[href="/outbound/linkedin"]');
    await click('.public-auth-links a[href="/signup"]'); await click('.auth-terms a[href="/legal/terms"]');
    expect(element(".policy-omission").textContent).toContain("version linked during the original signup has not been confirmed");
    await traverse("back"); await click(".auth-below > .auth-secondary");
    expect(location.pathname).toBe("/outbound/linkedin"); await returnToSource();
    expect(currentUrl()).toBe("/blog?q=company#results"); expect(router.state.location.key).toBe(key);
  });

  // 기능 : 연속 복귀는 가상 세션을 보존하고 Reset은 이전 출발 이력을 폐기하는지 확인한다.
  it("preserves the mock session on repeated return and expires the origin on Reset", async () => {
    await navigate("/components");
    await act(async () => {
      const select = element<HTMLSelectElement>(".preview-tools select"); select.value = "preview-a";
      select.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await navigate("/legal/terms?entry=session#reading"); const key = router.state.location.key;
    await click('.public-footer a[href="/outbound/linkedin"]');
    await act(async () => { const button = element(".company-outbound button"); button.click(); button.click(); });
    await settle(); expect(currentUrl()).toBe("/legal/terms?entry=session#reading");
    expect(router.state.location.key).toBe(key);
    expect(container.querySelector('.public-auth-links a[href="/app"]')).not.toBeNull();
    await navigate("/careers?entry=before-reset#values"); await click(".careers-copy a");
    const state = router.state.location.state;
    await navigate("/components"); await click(".preview-tools button");
    await navigate("/outbound/careers", state); await returnToSource();
    expect(currentUrl()).toBe("/careers");
    expect(container.querySelector('.public-auth-links a[href="/app"]')).toBeNull();
  });

  // 기능 : 공개 푸터 진입과 로그인 이력 왕복이 정책 문서를 다른 역할 화면으로 바꾸지 않게 한다.
  it("keeps footer and login navigation local without changing the session", async () => {
    for (const path of ["/affiliates", "/careers", "/legal/privacy", "/legal/terms"]) {
      await navigate("/?entry=footer"); await click(`.public-footer a[href="${path}"]`);
      expect(location.pathname).toBe(path); expect(document.activeElement).toBe(element("#main-content"));
      await click('.public-auth-links a[href="/login"]'); expect(location.pathname).toBe("/login");
      await traverse("back"); expect(location.pathname).toBe(path);
      expect(container.querySelector('.public-auth-links a[href="/app"]')).toBeNull();
    }
  });
});

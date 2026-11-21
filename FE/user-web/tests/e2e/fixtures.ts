import { test as base, expect } from "@playwright/test";
import type { Page, Request, Response, WebSocket, ConsoleMessage } from "@playwright/test";

type NetworkEvidence = { requests: string[]; sockets: string[]; violations: string[]; failures: string[]; consoleErrors: string[] };

export const test = base.extend<{ networkEvidence: NetworkEvidence }>({
  // 기능 : 모든 실제 요청을 관찰하고 API·외부 요청·실패·콘솔 오류를 가로채지 않고 검증한다.
  networkEvidence: [async function observeNetwork({ context, baseURL }, use, testInfo) {
    const evidence: NetworkEvidence = { requests: [], sockets: [], violations: [], failures: [], consoleErrors: [] };
    const origin = new URL(baseURL ?? "").origin;
    // 기능 : 실제 요청의 주소·방법·종류를 기록하고 정적 리소스 외 호출을 분류한다.
    function handleRequest(request: Request) {
      const url = new URL(request.url());
      evidence.requests.push(request.method() + " " + request.resourceType() + " " + url.href);
      if (url.origin !== origin || ["fetch", "xhr", "eventsource"].includes(request.resourceType()) ||
        request.method() !== "GET" || /\/api(?:\/|$)|supabase|oauth|auth\/callback/i.test(url.pathname)) {
        evidence.violations.push(request.url());
      }
    }
    // 기능 : 개발 서버의 같은 호스트 HMR 외 소켓 연결을 검출한다.
    function handleSocket(socket: WebSocket) {
      evidence.sockets.push(socket.url());
      if (new URL(socket.url()).host !== new URL(origin).host) evidence.violations.push(socket.url());
    }
    // 기능 : 실패한 요청도 미호출로 오해하지 않게 실패 증거에 포함한다.
    function handleRequestFailure(request: Request) { evidence.failures.push(request.url() + " " + request.failure()?.errorText); }
    // 기능 : HTTP 실패 응답을 정적 리소스 성공과 구분한다.
    function handleResponse(response: Response) { if (response.status() >= 400) evidence.failures.push(response.status() + " " + response.url()); }
    // 기능 : 실행 중 발생한 미처리 브라우저 예외를 기록한다.
    function handlePageError(error: Error) { evidence.consoleErrors.push(error.message); }
    // 기능 : 콘솔 오류를 모아 테스트 종료 시 실패로 판정한다.
    function handleConsole(message: ConsoleMessage) { if (message.type() === "error") evidence.consoleErrors.push(message.text()); }
    // 기능 : 같은 브라우저 컨텍스트에서 추가한 새 탭의 소켓·예외도 관찰한다.
    function observePage(page: Page) {
      page.on("websocket", handleSocket);
      page.on("pageerror", handlePageError);
      page.on("console", handleConsole);
    }
    context.on("request", handleRequest);
    context.on("requestfailed", handleRequestFailure);
    context.on("response", handleResponse);
    context.on("page", observePage);
    context.pages().forEach(observePage);
    await use(evidence);
    await testInfo.attach("network-evidence", { body: JSON.stringify(evidence, null, 2), contentType: "application/json" });
    expect(evidence.violations).toEqual([]);
    expect(evidence.failures).toEqual([]);
    expect(evidence.consoleErrors).toEqual([]);
  }, { auto: true }],
});
export { expect };

// 기능 : 실제 브라우저 링크와 세션 선택을 통해 내부 목록으로 이동한다.
export async function enterWorkspace(page: Page) {
  await page.goto("/login?returnTo=%2Fapp%2Fpreview");
  await page.getByRole("button", { name: "Continue as Alex" }).click();
  await expect(page.getByRole("link", { name: "Design Resources View item" })).toBeVisible();
}
// 기능 : 같은 ID 상세와 편집기를 실제 클릭으로 연다.
export async function openEditor(page: Page) {
  await page.getByRole("link", { name: /Design Resources View item/ }).click();
  await page.getByRole("button", { name: "Edit name" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
}

import { chromium, expect } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const output = process.env.CAPTURE_OUTPUT ? path.resolve(process.env.CAPTURE_OUTPUT) : path.join(root, "TODO/BONSAI_FE_MOCK_PLAN/RESULTS/evidence/g11");
const baseURL = process.env.PREVIEW_URL ?? "http://127.0.0.1:5173";
if (!["127.0.0.1", "localhost"].includes(new URL(baseURL).hostname)) throw new Error("Local preview required");
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const evidence = { checkedAt: new Date().toISOString(), baseURL, browser: await browser.version(), deviceScaleFactor: 1, frames: [], requests: [], sockets: [], violations: [], errors: [] };
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, locale: "en-GB" });
  // 기능 : 차단 없이 실제 요청을 관찰하고 외부·API 요청을 별도 기록한다.
  page.on("request", function observeRequest(request) {
    evidence.requests.push(`${request.method()} ${request.resourceType()} ${request.url()}`);
    if (new URL(request.url()).origin !== new URL(baseURL).origin || ["fetch", "xhr", "eventsource"].includes(request.resourceType()) || request.method() !== "GET") evidence.violations.push(request.url());
  });
  // 기능 : 같은 호스트의 HMR 소켓과 외부 연결을 구별한다.
  page.on("websocket", function observeSocket(socket) { evidence.sockets.push(socket.url()); if (new URL(socket.url()).host !== new URL(baseURL).host) evidence.violations.push(socket.url()); });
  // 기능 : 실행 예외·콘솔·실패 응답을 화면 증거에 함께 남긴다.
  page.on("pageerror", function observeError(error) { evidence.errors.push(error.message); });
  // 기능 : 콘솔 오류를 캡처 성공으로 숨기지 않는다.
  page.on("console", function observeConsole(message) { if (message.type() === "error") evidence.errors.push(message.text()); });
  // 기능 : 실패한 요청도 발생한 요청으로 센다.
  page.on("requestfailed", function observeFailure(request) { evidence.errors.push(`${request.url()} ${request.failure()?.errorText}`); });
  // 기능 : HTTP 오류 응답을 확인한다.
  page.on("response", function observeResponse(response) { if (response.status() >= 400) evidence.errors.push(`${response.status()} ${response.url()}`); });
  // 기능 : 폰트·실제 이미지 준비가 끝난 화면만 비교 대상으로 촬영한다.
  async function capture(name, selector, top = 0) {
    await page.waitForLoadState("networkidle");
    if (await page.locator(".help-index").count()) await expect(page.locator(".help-index")).toHaveAttribute("aria-busy", "false");
    await page.evaluate(() => document.fonts.ready);

    if (selector) await page.locator(selector).evaluate((element, y) => scrollTo(0, scrollY + element.getBoundingClientRect().top - y), top);
    else await page.evaluate(() => scrollTo(0, 0));
    if (name !== "signup-05") await page.evaluate(() => { if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); });
    await page.mouse.move(1430, 880);
    await expect.poll(() => page.locator("img").evaluateAll(images => images.filter(image => { const r = image.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; }).every(image => image.complete && image.naturalWidth > 0))).toBe(true);
    await page.waitForTimeout(100);
    await page.screenshot({ path: path.join(output, `${name}.png`) });
    evidence.frames.push({ name, url: page.url(), viewport: page.viewportSize(), scrollY: await page.evaluate(() => scrollY), selector, targetTop: top });
  }
  await page.goto(baseURL + "/login"); await capture("login-02");
  await page.getByRole("textbox",{name:"Email",exact:true}).fill("jdoe@example.test"); await page.getByLabel("Password",{exact:true}).fill("SampleOnly123!"); await capture("login-03");
  await page.getByRole("checkbox",{name:/I'm not a robot/}).check(); await capture("login-04");
  await page.getByRole("textbox",{name:"Email",exact:true}).fill("alex@example.test"); await page.getByLabel("Password",{exact:true}).fill("PreviewOnly123!"); await page.getByRole("button",{name:"Log in",exact:true}).click(); await expect(page.locator(".auth-account > button")).toBeVisible();
  await page.locator(".auth-account > button").click(); await capture("logout-01"); await page.getByRole("button",{name:"Logout",exact:true}).click(); await expect(page.locator("h1")).toHaveText("Log in to Bonsai"); await capture("logout-02");
  await page.getByRole("button",{name:"Dismiss authentication notice"}).click();
  for (const width of [320,390,768]) { await page.setViewportSize({width,height:900}); await capture(`login-${width}`); }
  await writeFile(path.join(output, "browser-captures.json"), JSON.stringify(evidence, null, 2));
  if (evidence.violations.length || evidence.errors.length) throw new Error(JSON.stringify({ violations: evidence.violations, errors: evidence.errors }));
  console.log(JSON.stringify({ frames: evidence.frames.length, requests: evidence.requests.length, violations: evidence.violations.length, errors: evidence.errors.length }));
} finally { await browser.close(); }

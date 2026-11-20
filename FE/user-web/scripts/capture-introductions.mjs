import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const output = process.env.CAPTURE_OUTPUT ? path.resolve(process.env.CAPTURE_OUTPUT) : path.join(root, "TODO/BONSAI_FE_MOCK_PLAN/RESULTS/evidence/g03");
const baseURL = process.env.PREVIEW_URL ?? "http://127.0.0.1:5173";
if (!["127.0.0.1", "localhost"].includes(new URL(baseURL).hostname)) throw new Error("Local preview required");
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const evidence = { checkedAt: new Date().toISOString(), baseURL, browser: await browser.version(), viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, frames: [], narrowFrames: [], requests: [], sockets: [], violations: [], errors: [] };
try {
  const page = await browser.newPage({ viewport: evidence.viewport, deviceScaleFactor: 1 });
  // 기능 : 요청을 차단하지 않고 실제 외부·업무·인증 호출과 정적 리소스를 구분한다.
  page.on("request", function observeRequest(request) {
    evidence.requests.push(`${request.method()} ${request.resourceType()} ${request.url()}`);
    if (new URL(request.url()).origin !== new URL(baseURL).origin || ["fetch", "xhr", "eventsource"].includes(request.resourceType()) || request.method() !== "GET") evidence.violations.push(request.url());
  });
  // 기능 : 같은 호스트 HMR 소켓과 외부 연결을 구분한다.
  page.on("websocket", function observeSocket(socket) { evidence.sockets.push(socket.url()); if (new URL(socket.url()).host !== new URL(baseURL).host) evidence.violations.push(socket.url()); });
  // 기능 : 브라우저 예외를 캡처 결과와 함께 기록한다.
  page.on("pageerror", function observeError(error) { evidence.errors.push(error.message); });
  // 기능 : 콘솔 오류를 성공 기록에서 누락하지 않는다.
  page.on("console", function observeConsole(message) { if (message.type() === "error") evidence.errors.push(message.text()); });
  // 기능 : 요청 실패도 실제 발생한 요청으로 기록한다.
  page.on("requestfailed", function observeFailure(request) { evidence.errors.push(`${request.url()} ${request.failure()?.errorText}`); });
  // 기능 : HTTP 오류 응답을 정적 리소스 정상 로드와 구분한다.
  page.on("response", function observeResponse(response) { if (response.status() >= 400) evidence.errors.push(`${response.status()} ${response.url()}`); });
  // 기능 : 실제 직접 URL 이동 뒤 로컬 이미지와 폰트의 로드를 기다린다.
  async function visit(route) { await page.mouse.move(1400, 850); await page.goto(baseURL + route); await ready(); }
  // 기능 : 이미지·폰트 로드가 끝난 동일 상태에서만 캡처한다.
  async function ready() { await page.waitForLoadState("networkidle"); await page.evaluate(() => document.fonts.ready); await page.locator("img").evaluateAll(images => Promise.all(images.map(image => image.decode()))); }
  // 기능 : 원본 관찰 앵커의 정규화 위치에 맞춰 스크롤하고 실제 좌표를 기록한다.
  async function capture(name, selector = null, top = 0, state = "anonymous") {
    if (selector) await page.locator(selector).evaluate((element, y) => scrollTo(0, element.getBoundingClientRect().top + scrollY - y), top);
    else await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(120);
    await page.screenshot({ path: path.join(output, `${name}.png`) });
    evidence.frames.push({ name, route: new URL(page.url()).pathname, selector, targetTop: top, scrollY: await page.evaluate(() => scrollY), state,
      typography: await page.locator("h1").evaluate(element => ({ family: getComputedStyle(element).fontFamily, size: getComputedStyle(element).fontSize, lineHeight: getComputedStyle(element).lineHeight, weight: getComputedStyle(element).fontWeight })) });
  }
  await visit("/");
  for (const [menu, name] of [["Industries", "consulting-01"], ["Product", "crm-01"]]) {
    await page.getByRole("button", { name: menu, exact: true }).click(); await capture(name); await page.keyboard.press("Escape");
  }
  await visit("/software/consulting");
  await capture("consulting-02");
  await capture("consulting-03", ".intro-overview-image", 249);
  await capture("consulting-04", ".intro-feature-grid article:first-child", 360);
  await capture("consulting-05", ".intro-testimonial", 360);
  await capture("consulting-06", ".intro-banner-0", 201);
  await capture("consulting-07", ".intro-banner-1", 160);
  await capture("consulting-08", ".intro-stat-tiles", 102);
  await visit("/crm");
  await capture("crm-02");
  await capture("crm-03", ".intro-overview > h2", 113);
  await capture("crm-04", ".intro-banner-0 .intro-banner-copy h2", 160);
  await capture("crm-05", ".intro-testimonial", 154);
  await capture("crm-06", ".intro-templates > h2", 100);
  await capture("crm-07", ".intro-resource-cta", 202);
  await capture("crm-08", ".intro-explore > h2", 180);
  await capture("crm-09", ".intro-faq > h2", 248);
  await page.getByRole("button", { name: "Does Bonsai offer lead generation automation?" }).click();
  await capture("crm-10", ".intro-faq > h2", 248, "first FAQ expanded");
  await visit("/software/small-businesses");
  await capture("small-businesses-01"); await capture("small-businesses-02", ".intro-testimonial", 267);
  await page.getByRole("link", { name: "Log in", exact: true }).first().click();
  await page.getByRole("button", { name: "Continue as Alex" }).click();
  await page.getByRole("link", { name: "Public", exact: true }).click();
  await page.locator(".public-audiences").getByRole("link", { name: "Small businesses", exact: true }).click(); await ready();
  await capture("small-businesses-03", ".intro-articles > h2", 94, "explicit local Alex session; source header cause unknown");
  await capture("small-businesses-04", ".intro-pagination", 749, "explicit local Alex session; source header cause unknown");
  await page.setViewportSize({ width: 390, height: 844 });
  for (const [route, name] of [["/crm", "crm"], ["/software/consulting", "consulting"], ["/software/small-businesses", "small-businesses"]]) {
    await visit(route); await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(120);
    await page.screenshot({ path: path.join(output, `${name}-narrow.png`), fullPage: true });
    evidence.narrowFrames.push({ name, route, viewport: { width: 390, height: 844 }, scrollY: await page.evaluate(() => scrollY), state: "anonymous" });
  }
  await writeFile(path.join(output, "capture-evidence.json"), JSON.stringify(evidence, null, 2) + "\n");
  process.stdout.write(JSON.stringify({ frames: evidence.frames.length, requests: evidence.requests.length, violations: evidence.violations, errors: evidence.errors }) + "\n");
  if (evidence.violations.length || evidence.errors.length) process.exitCode = 1;
} finally { await browser.close(); }

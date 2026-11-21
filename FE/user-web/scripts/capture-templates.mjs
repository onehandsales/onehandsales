import { chromium, expect } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const output = process.env.CAPTURE_OUTPUT ? path.resolve(process.env.CAPTURE_OUTPUT) : path.join(root, "TODO/BONSAI_FE_MOCK_PLAN/RESULTS/evidence/g06");
const baseURL = process.env.PREVIEW_URL ?? "http://127.0.0.1:5173";
if (!["127.0.0.1", "localhost"].includes(new URL(baseURL).hostname)) throw new Error("Local preview required");
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const evidence = { checkedAt: new Date().toISOString(), baseURL, browser: await browser.version(), deviceScaleFactor: 1, frames: [], requests: [], sockets: [], violations: [], errors: [] };
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
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
    if (new URL(page.url()).pathname.startsWith("/templates")) await expect(page.locator(".template-results")).toHaveAttribute("aria-busy", "false");
    await page.evaluate(() => document.fonts.ready);

    if (selector) await page.locator(selector).evaluate((element, y) => scrollTo(0, scrollY + element.getBoundingClientRect().top - y), top);
    else await page.evaluate(() => scrollTo(0, 0));
    await page.mouse.move(1430, 880);
    await expect.poll(() => page.locator("img").evaluateAll(images => images.filter(image => { const r = image.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; }).every(image => image.complete && image.naturalWidth > 0))).toBe(true);
    await page.waitForTimeout(100);
    await page.screenshot({ path: path.join(output, `${name}.png`) });
    evidence.frames.push({ name, url: page.url(), viewport: page.viewportSize(), scrollY: await page.evaluate(() => scrollY), selector, targetTop: top });
  }
  await page.goto(baseURL + "/templates"); await expect(page.locator(".template-card")).toHaveCount(24); await capture("filter-initial");
  await capture("filter-all", ".template-type-filters", 95);
  await page.getByRole("button", { name: "Agreements", exact: true }).click(); await expect(page.getByRole("button", { name: "Agreements", exact: true })).toHaveAttribute("aria-pressed", "true"); await capture("filter-agreements", ".template-type-filters", 95);
  await page.getByRole("button", { name: "Quotes", exact: true }).click(); await expect(page.getByRole("button", { name: "Quotes", exact: true })).toHaveAttribute("aria-pressed", "true"); await capture("filter-quotes", ".template-type-filters", 95);
  await capture("filter-later-quotes", ".template-card:nth-child(16)", 80);
  await page.goto(baseURL + "/quote-template/ecommerce-website"); await expect(page.locator("h1")).toContainText("eCommerce"); await capture("quote-hero");
  await capture("quote-trust", ".template-trust > p", 112);
  await capture("quote-pricing", "#quote-section-2", 82);
  await capture("quote-faq", ".quote-faq", 180);
  await page.goto(baseURL + "/invoice-template"); await expect(page.locator("h1")).toHaveText("Invoice Template"); await capture("invoice-hero");
  await capture("invoice-concept", ".invoice-concept", 114);
  await capture("invoice-download-description", ".invoice-download-section", 96);
  await capture("invoice-downloads", ".invoice-download-grid", 70);
  await capture("invoice-formats", ".invoice-formats", 200);
  await capture("invoice-industries", ".invoice-industries article:first-child h2", 134);
  await capture("invoice-related", ".invoice-related", 105);
  await capture("invoice-benefits", ".invoice-benefits", 108);
  await capture("invoice-word", ".invoice-format-comparison", 102);
  await page.setViewportSize({ width: 390, height: 600 }); await page.goto(baseURL + "/templates"); await expect(page.locator(".template-card")).toHaveCount(24); await capture("catalog-mobile");
  await page.goto(baseURL + "/invoice-template"); await capture("invoice-mobile");
  await page.goto(baseURL + "/quote-template/ecommerce-website"); await capture("quote-mobile");
  await writeFile(path.join(output, "browser-captures.json"), JSON.stringify(evidence, null, 2));
  if (evidence.violations.length || evidence.errors.length) throw new Error(JSON.stringify({ violations: evidence.violations, errors: evidence.errors }));
  console.log(JSON.stringify({ frames: evidence.frames.length, requests: evidence.requests.length, violations: evidence.violations.length, errors: evidence.errors.length }));
} finally { await browser.close(); }

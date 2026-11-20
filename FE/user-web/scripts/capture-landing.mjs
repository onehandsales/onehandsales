import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repository = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const output = process.env.CAPTURE_OUTPUT ? path.resolve(process.env.CAPTURE_OUTPUT) : path.join(repository, "TODO/BONSAI_FE_MOCK_PLAN/RESULTS/evidence/g02");
const baseURL = process.env.PREVIEW_URL ?? "http://127.0.0.1:5173";
if (!["127.0.0.1", "localhost"].includes(new URL(baseURL).hostname)) throw new Error("Local preview URL required");
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const evidence = { browser: await browser.version(), viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, frames: [], requests: [], violations: [], errors: [] };
try {
  const page = await browser.newPage({ viewport: evidence.viewport, deviceScaleFactor: 1 });
  // 기능 : 차단 없이 실제 네트워크를 관찰하여 로컬 정적 리소스 이외 요청을 기록한다.
  page.on("request", function recordRequest(request) {
    evidence.requests.push(`${request.method()} ${request.resourceType()} ${request.url()}`);
    if (new URL(request.url()).origin !== new URL(baseURL).origin || ["fetch", "xhr", "eventsource"].includes(request.resourceType()) || request.method() !== "GET") evidence.violations.push(request.url());
  });
  // 기능 : 캡처 중 미처리 오류를 비교 증거와 함께 남긴다.
  page.on("pageerror", function recordError(error) { evidence.errors.push(error.message); });
  // 기능 : React 경고 등 콘솔 오류도 시각 캡처의 실행 증거에 포함한다.
  page.on("console", function recordConsole(message) { if (message.type() === "error") evidence.errors.push(message.text()); });
  // 기능 : 실패한 리소스를 API 미호출 성공으로 오인하지 않도록 기록한다.
  page.on("requestfailed", function recordFailure(request) { evidence.errors.push(`${request.url()} ${request.failure()?.errorText}`); });
  await page.goto(baseURL);
  await page.evaluate(() => document.fonts.ready);
  await page.locator(".public-hero-portrait img").evaluate(image => image.decode());
  await page.waitForLoadState("networkidle");
  // 기능 : 같은 뷰포트에서 원본 요소의 관찰 위치에 맞춰 스크롤하고 렌더링 값을 기록한다.
  async function capture(name, selector, top) {
    if (selector) await page.locator(selector).evaluate((element, y) => window.scrollTo(0, element.getBoundingClientRect().top + scrollY - y), top);
    else await page.evaluate(() => window.scrollTo(0, 0));
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(120);
    await page.screenshot({ path: path.join(output, `${name}.png`) });
    evidence.frames.push({ name, selector, targetTop: top, scrollY: await page.evaluate(() => scrollY),
      heading: await page.locator("h1").evaluate(element => ({ font: getComputedStyle(element).fontFamily, size: getComputedStyle(element).fontSize, line: getComputedStyle(element).lineHeight, weight: getComputedStyle(element).fontWeight })) });
  }
  await capture("hero", null, 0);
  await capture("step-01", ".public-dashboard-promo", 130);
  await capture("step-02", ".public-product-groups", 237);
  await capture("step-03", ".public-testimonials", 291);
  await page.getByRole("button", { name: "Testimonial 01: Alison" }).click();
  await capture("step-04", ".public-testimonials", 291);
  await capture("step-05", ".public-finance-art", 181);
  await capture("step-06", ".public-experience-art", 172);
  await capture("step-07", ".public-reviews h2", 146);
  await capture("step-08", ".public-support", 242);
  await capture("step-09", ".public-trial-banner", 409);
  await capture("step-10", ".public-footer", 169);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.screenshot({ path: path.join(output, "step-11.png") });
  evidence.frames.push({ name: "step-11", scrollY: await page.evaluate(() => scrollY) });
  for (const menu of ["Product", "Industries", "Templates", "Resources"]) {
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.getByRole("button", { name: menu, exact: true }).click();
    await page.screenshot({ path: path.join(output, `menu-${menu.toLowerCase()}.png`) });
    evidence.frames.push({ name: `menu-${menu.toLowerCase()}`, scrollY: await page.evaluate(() => scrollY), menu });
    if (menu === "Templates") {
      await page.getByRole("tab", { name: "Invoice Templates", exact: true }).click();
      await page.screenshot({ path: path.join(output, "menu-invoice.png") });
      evidence.frames.push({ name: "menu-invoice", scrollY: 0, menu, category: "Invoice Templates" });
    }
    await page.keyboard.press("Escape");
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: path.join(output, "narrow.png"), fullPage: true });
  await writeFile(path.join(output, "capture-evidence.json"), JSON.stringify(evidence, null, 2));
  process.stdout.write(JSON.stringify({ frames: evidence.frames.length, requests: evidence.requests.length, violations: evidence.violations, errors: evidence.errors }) + "\n");
  if (evidence.violations.length || evidence.errors.length) process.exitCode = 1;
} finally { await browser.close(); }

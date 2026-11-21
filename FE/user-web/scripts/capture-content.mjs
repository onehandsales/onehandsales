import { chromium, expect } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const output = process.env.CAPTURE_OUTPUT ? path.resolve(process.env.CAPTURE_OUTPUT) : path.join(root, "TODO/BONSAI_FE_MOCK_PLAN/RESULTS/evidence/g05");
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
    if (new URL(page.url()).pathname === "/blog") await expect(page.locator(".blog-results")).toHaveAttribute("aria-busy", "false");
    await page.evaluate(() => document.fonts.ready);
    await expect.poll(() => page.locator("img").evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0))).toBe(true);
    if (selector) await page.locator(selector).evaluate((element, y) => scrollTo(0, scrollY + element.getBoundingClientRect().top - y), top);
    await page.mouse.move(1430, 880);
    await page.waitForTimeout(100);
    await page.screenshot({ path: path.join(output, `${name}.png`) });
    evidence.frames.push({ name, url: page.url(), viewport: page.viewportSize(), scrollY: await page.evaluate(() => scrollY), selector, targetTop: top });
  }
  await page.goto(baseURL + "/");
  await page.getByRole("button", { name: "Resources", exact: true }).click();
  await expect(page.locator("#public-mega-menu")).toBeVisible();
  // 이유 : 메뉴를 유지한 채 캡처해야 하므로 이 상태에서는 포인터를 메뉴 안에 둔다.
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: path.join(output, "blog-menu.png") });
  evidence.frames.push({ name: "blog-menu", url: page.url(), viewport: page.viewportSize(), scrollY: 0 });
  await page.goto(baseURL + "/blog"); await expect(page.locator(".blog-grid .blog-card")).toHaveCount(6); await capture("blog-initial");
  await page.getByRole("button", { name: "General", exact: true }).click(); await expect(page.getByRole("button", { name: "General", exact: true })).toHaveAttribute("aria-pressed", "true"); await capture("blog-general");
  await capture("blog-scrolled", ".blog-search", 94);
  await page.getByRole("button", { name: "Start a business", exact: true }).click(); await expect(page.locator(".blog-grid .blog-card")).toHaveCount(4); await capture("blog-start-business", ".blog-search", 94);
  await page.getByRole("searchbox").fill("marketing"); await expect(page.locator(".blog-grid .blog-card")).toHaveCount(1); await capture("blog-marketing", ".blog-search", 94);
  await page.getByRole("link", { name: /7 steps to launching/ }).click(); await expect(page.locator("h1")).toHaveText("7 steps to launching your digital marketing agency"); await capture("article-top");
  await capture("article-body", ".article-byline", 100);
  await page.getByRole("link", { name: "2. Find your niche", exact: true }).click(); await expect(page.locator("#find-your-niche")).toBeInViewport(); await capture("article-niche", "#find-your-niche", 84);
  await page.getByRole("link", { name: "Take your agency to the next level", exact: true }).click(); await capture("article-ending", ".article-award", 212);
  await page.setViewportSize({ width: 390, height: 600 }); await page.goto(baseURL + "/blog"); await expect(page.locator(".blog-grid .blog-card")).toHaveCount(6); await capture("blog-mobile");
  await page.goto(baseURL + "/blog/how-to-start-a-digital-marketing-agency"); await expect(page.locator("h1")).toContainText("7 steps"); await capture("article-mobile");
  await writeFile(path.join(output, "browser-captures.json"), JSON.stringify(evidence, null, 2));
  if (evidence.violations.length || evidence.errors.length) throw new Error(JSON.stringify({ violations: evidence.violations, errors: evidence.errors }));
  console.log(JSON.stringify({ frames: evidence.frames.length, requests: evidence.requests.length, violations: evidence.violations.length, errors: evidence.errors.length }));
} finally { await browser.close(); }

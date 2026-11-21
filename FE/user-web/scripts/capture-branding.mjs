import { chromium, expect } from "@playwright/test";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const output = process.env.CAPTURE_OUTPUT ?? "/tmp/onehandsales-g16/captures";
const baseURL = process.env.PREVIEW_URL ?? "http://127.0.0.1:5173";
if (!["127.0.0.1", "localhost"].includes(new URL(baseURL).hostname)) throw new Error("Local preview required");
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const record = { date: "2026-11-21 KST", baseURL, browser: await browser.version(), deviceScaleFactor: 1, frames: [], requests: [], violations: [], errors: [] };
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, locale: "en-GB" });
  // 기능 : 차단 없이 실제 요청의 출처와 종류를 확인한다.
  page.on("request", function request(value) { record.requests.push(value.method() + " " + value.resourceType() + " " + value.url()); if (new URL(value.url()).origin !== new URL(baseURL).origin || ["fetch", "xhr", "eventsource"].includes(value.resourceType()) || value.method() !== "GET") record.violations.push(value.url()); });
  // 기능 : 실패한 요청과 브라우저 오류를 성공 캡처로 감추지 않는다.
  page.on("requestfailed", function failed(value) { record.errors.push(value.url() + " " + value.failure()?.errorText); });
  // 기능 : HTTP 오류 응답을 기록한다.
  page.on("response", function response(value) { if (value.status() >= 400) record.errors.push(value.status() + " " + value.url()); });
  // 기능 : 미처리 실행 예외를 기록한다.
  page.on("pageerror", function error(value) { record.errors.push(value.message); });
  // 기능 : 브라우저 console 오류를 기록한다.
  page.on("console", function consoleError(value) { if (value.type() === "error") record.errors.push(value.text()); });
  // 기능 : 폰트·선택 상태·자산을 기다린 뒤 원본 대응 위치를 촬영한다.
  async function capture(name, lower = false, keepFocus = false) {
    await page.waitForLoadState("networkidle"); await page.evaluate(() => document.fonts.ready);
    await expect.poll(() => page.locator("img").evaluateAll(images => images.every(img => img.complete && img.naturalWidth > 0))).toBe(true);
    if (lower) await page.locator(".brand-columns").evaluate(element => scrollTo(0, scrollY + element.getBoundingClientRect().top - 49)); else await page.evaluate(() => scrollTo(0, 0));
    if (!keepFocus) await page.evaluate(() => { if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); });
    await page.mouse.move(1420, 880); await page.screenshot({ path: path.join(output, name + ".png") });
    record.frames.push({ name, url: page.url(), viewport: page.viewportSize(), scrollY: await page.evaluate(() => scrollY), controls: await page.locator('.branding-panel,.brand-columns,.brand-preview,.sample-invoice,.sample-invoice-header,.sample-invoice-logo').evaluateAll(nodes => nodes.map(node => ({ class: node.className, rect: node.getBoundingClientRect().toJSON() }))) });
  }
  await page.goto(baseURL + "/login?returnTo=%2Fapp%2Fsettings%2Fbranding"); await page.waitForLoadState("networkidle"); await page.getByRole("button", { name: "Continue as Alex" }).click(); await expect(page.getByRole("combobox", { name: "Header Image" })).toBeVisible();
  await page.getByLabel("Choose company logo").setInputFiles({ name: "spencer.png", mimeType: "image/png", buffer: await readFile(path.join(root, "FE/user-web/tests/fixtures/recorded-branding-logo.png")) }); await expect(page.getByAltText("Company logo preview")).toBeVisible();
  await capture("01-none-top"); await capture("02-none-lower", true); await page.getByRole("combobox", { name: "Header Image" }).click(); await capture("03-header-menu", true, true);
  await page.getByRole("option", { name: "Abstract", exact: true }).click(); await capture("04-abstract", true, true);
  await page.getByRole("combobox", { name: "Header Image" }).click(); await page.getByRole("option", { name: "Plant", exact: true }).click(); await capture("05-plant", true, true);
  await page.getByRole("button", { name: "Save Changes" }).click(); await expect(page.getByRole("status")).toContainText("branding settings have been saved"); await capture("06-saved-plant"); await page.getByRole("button", { name: "Dismiss saved message" }).click();
  for (const width of [320, 390, 768, 1024, 1920]) { await page.setViewportSize({ width, height: 900 }); await capture("width-" + width); }
  await page.setViewportSize({ width: 320, height: 600 }); await page.locator(".sample-invoice").scrollIntoViewIfNeeded(); await page.screenshot({ path: path.join(output, "width-320-preview.png") });
  await page.locator(".preview-tools summary").click(); await page.getByRole("button", { name: "Reset preview" }).click(); await expect(page).toHaveURL(baseURL + "/components"); await page.locator(".preview-tools summary").click(); await expect(page.getByRole("combobox", { name: "Session", exact: true })).toHaveValue("guest"); await expect(page.getByRole("combobox", { name: "Scenario", exact: true })).toHaveValue("normal"); await page.waitForLoadState("networkidle");
  await writeFile(path.join(output, "browser-captures.json"), JSON.stringify(record, null, 2)); expect(record.violations).toEqual([]); expect(record.errors).toEqual([]);
} finally { await writeFile(path.join(output, "browser-captures.json"), JSON.stringify(record, null, 2)); await browser.close(); }

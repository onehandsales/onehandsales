import { chromium, expect } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const output = process.env.CAPTURE_OUTPUT ? path.resolve(process.env.CAPTURE_OUTPUT) : path.join(root, "TODO/BONSAI_FE_MOCK_PLAN/RESULTS/evidence/g15");
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
    if (name !== "logo-03") await page.waitForLoadState("networkidle");
    if (await page.locator(".help-index").count()) await expect(page.locator(".help-index")).toHaveAttribute("aria-busy", "false");
    await page.evaluate(() => document.fonts.ready);

    if (selector) await page.locator(selector).evaluate((element, y) => scrollTo(0, scrollY + element.getBoundingClientRect().top - y), top);
    else await page.evaluate(() => scrollTo(0, 0));
    if (!["details-04", "details-05"].includes(name)) await page.evaluate(() => { if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); });
    if (!["details-03", "logo-02"].includes(name)) await page.mouse.move(1430, 880);
    await expect.poll(() => page.locator("img").evaluateAll(images => images.filter(image => { const r = image.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; }).every(image => image.complete && image.naturalWidth > 0))).toBe(true);
    await page.waitForTimeout(100);
    await page.screenshot({ path: path.join(output, `${name}.png`) });
    evidence.frames.push({ name, url: page.url(), viewport: page.viewportSize(), scrollY: await page.evaluate(() => scrollY), selector, targetTop: top });
  }
  await page.goto(baseURL + "/login"); await page.getByRole("button",{name:"Continue as Alex"}).click(); await expect(page.locator("h1")).toContainText("Good evening"); await capture("details-01");
  await page.locator(".company-tools summary").click(); await page.getByLabel("Company scenario").selectOption("slow"); await page.locator(".company-tools summary").click(); await page.getByRole("button",{name:"Add Details",exact:true}).click(); await expect(page.getByRole("dialog").getByRole("textbox")).toHaveValue("Studio A"); await page.getByRole("dialog").getByRole("textbox").fill("Joe Studio"); await capture("details-02"); await page.getByRole("button",{name:"Add Address",exact:true}).hover(); await capture("details-03"); await page.getByRole("button",{name:"Add Address",exact:true}).click(); await page.getByRole("combobox",{name:"Currency",exact:true}).selectOption("USD"); await page.getByLabel("Address 1",{exact:true}).focus(); await capture("details-04");
  await page.getByLabel("Address 1",{exact:true}).fill("75 Ayer Rajah Crescent, #02-02, Singapore, 139953"); await page.getByLabel("City",{exact:true}).fill("Singapore"); await page.getByLabel("Postal Code").fill("139953"); await page.getByLabel("Region / State").fill("Singapore"); await page.getByRole("combobox",{name:"Country",exact:true}).selectOption("Singapore"); await page.getByRole("combobox",{name:"Country",exact:true}).focus(); await capture("details-05"); await page.getByRole("button",{name:"Save Address",exact:true}).click(); await capture("details-06"); await capture("logo-01"); await page.getByRole("button",{name:/Add An/}).hover(); await capture("logo-02");
  await page.getByLabel("Choose company logo").setInputFiles(path.join(root,"FE/user-web/tests/fixtures/recorded-company-logo.png")); await expect(page.getByRole("status")).toContainText("Reading image"); await capture("logo-03"); await expect(page.getByAltText("Company logo preview")).toBeVisible(); await capture("details-07"); await capture("logo-04"); await page.getByRole("button",{name:"Save",exact:true}).click(); await expect(page.getByRole("dialog")).toHaveCount(0); await page.getByRole("button",{name:"Create your booking page"}).click(); await capture("details-08"); await page.locator(".company-tools summary").click(); await page.getByLabel("Company scenario").selectOption("normal"); await page.locator(".company-tools summary").click();
  await page.locator(".auth-account>button").click(); await page.getByRole("link",{name:"Settings",exact:true}).click(); await expect(page.getByRole("textbox",{name:/Company Name/})).toHaveValue("Joe Studio"); await capture("profile-01"); await page.getByRole("button",{name:"Disabled",exact:true}).click(); await capture("profile-02"); await page.getByRole("button",{name:"Save Changes"}).click(); await expect(page.locator(".company-save-notice")).toBeVisible(); await capture("profile-03"); await page.getByRole("button",{name:"Dismiss saved message"}).click();
  for (const width of [320,390,768]) { await page.setViewportSize({width,height:900}); await capture("settings-"+width); await capture("settings-address-"+width,".address-row",24); }
  await page.getByRole("link",{name:/View Profile/}).click(); await capture("profile-disabled"); await page.getByRole("link",{name:"Company settings",exact:true}).click(); await page.getByRole("button",{name:"Enabled",exact:true}).click(); await page.getByRole("button",{name:"Save Changes"}).click(); await expect(page.locator(".company-save-notice")).toBeVisible(); await page.getByRole("link",{name:/View Profile/}).click(); await capture("profile-enabled");
  await page.getByRole("link",{name:"Company settings",exact:true}).click(); await page.getByRole("link",{name:"Back to dashboard"}).click(); await page.getByRole("button",{name:"Add Details",exact:true}).click(); await page.setViewportSize({width:320,height:600}); await capture("dialog-320"); await page.getByRole("button",{name:"Save",exact:true}).scrollIntoViewIfNeeded(); await capture("dialog-bottom-320"); await page.keyboard.press("Escape");
  await writeFile(path.join(output,"browser-captures.json"),JSON.stringify(evidence,null,2)); if(evidence.violations.length || evidence.errors.length) throw new Error(JSON.stringify({violations:evidence.violations,errors:evidence.errors})); console.log(JSON.stringify({frames:evidence.frames.length,requests:evidence.requests.length,violations:evidence.violations.length,errors:evidence.errors.length}));
} finally { await browser.close(); }

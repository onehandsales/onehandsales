import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { test, expect } from "./fixtures";
import downloads from "../../src/features/public-template/data/download-content.json" with { type: "json" };

test("template types, industry, search and detail retain real history and public identity", async ({ page }) => {
  await page.goto("/templates"); await expect(page.locator(".template-grid .template-card")).toHaveCount(24);
  await expect(page.locator(".template-card").first().locator("img")).toHaveCount(0);
  await page.getByRole("button", { name: "Quotes", exact: true }).click();
  await page.getByRole("searchbox", { name: "Search templates" }).fill("ecommerce");
  await expect(page.locator(".template-card")).toHaveCount(1);
  await page.evaluate(() => scrollTo(0, 350)); const scroll = await page.evaluate(() => scrollY);
  await page.locator(".template-card").click(); await expect(page.locator("h1")).toHaveText("eCommerce Website Quotation Template");
  await page.getByRole("link", { name: "Factors to consider in determining your pricing", exact: true }).click();
  await expect(page.locator("#quote-section-2")).toBeInViewport();
  await page.getByRole("link", { name: "Quotes", exact: true }).click();
  await expect(page.getByRole("searchbox")).toHaveValue("ecommerce");
  await expect.poll(async () => Math.abs(await page.evaluate(() => scrollY) - scroll)).toBeLessThan(4);
  await page.goForward(); await expect(page.locator("h1")).toContainText("eCommerce");
  await page.reload(); await expect(page.locator("h1")).toContainText("eCommerce");
  await page.goto("/invoice-template"); await page.waitForLoadState("networkidle");
  await expect(page.locator("h1")).toBeInViewport();
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  await page.goto("/templates?type=Invoices&industry=General&q=itemized&page=999");
  await expect(page.locator(".template-card h2")).toHaveText("Free Itemized Bill Invoice Templates");
  await expect(page.locator(".template-pagination")).toContainText("1 / 1");
  await page.getByRole("button", { name: "Acting", exact: true }).click();
  await expect(page.getByRole("heading", { name: "No matching templates" })).toBeVisible();
  await page.goto("/templates/quotes?page=2"); await expect(page.locator(".template-pagination")).toContainText("2 / 2");
  await page.getByRole("button", { name: "‹ Previous", exact: true }).click(); await expect(page.locator(".template-pagination")).toContainText("1 / 2");
  await page.goBack(); await expect(page.locator(".template-pagination")).toContainText("2 / 2");
});

test("all fifteen real files download unchanged and Google links remain a local dialog", async ({ page }) => {
  await page.goto("/invoice-template");
  await page.getByRole("link", { name: "Get Template", exact: true }).first().click();
  await expect(page.locator("#download-invoice")).toBeInViewport();
  for (const item of downloads) {
    const card = page.getByRole("article", { name: item.title, exact: true });
    for (const format of item.formats.filter(format => format.file)) {
      const wait = page.waitForEvent("download");
      await card.getByRole("link", { name: format.label, exact: true }).click();
      const download = await wait; expect(await download.failure()).toBeNull();
      const received = await readFile((await download.path())!);
      const original = await readFile(`public${format.file}`);
      expect(createHash("sha256").update(received).digest("hex")).toBe(createHash("sha256").update(original).digest("hex"));
      expect(received.subarray(0, format.label === "PDF" ? 5 : 2).toString()).toBe(format.label === "PDF" ? "%PDF-" : "PK");
      expect(download.suggestedFilename()).toBe(`${item.id}.${format.file.split(".").at(-1)}`);
      // 이유 : 브라우저의 초당 연속 다운로드 제한과 파일 수신 검증을 구분한다.
      await page.waitForTimeout(200);
    }
  }
  const button = page.getByRole("article", { name: "Invoice Template", exact: true }).getByRole("button", { name: "Google Docs", exact: true });
  await button.click(); await expect(page.getByRole("dialog")).toContainText("실제 Google 로그인이나 문서 복사를 실행하지 않았습니다");
  await page.keyboard.press("Escape"); await expect(page.getByRole("dialog")).toHaveCount(0); await expect(button).toBeFocused();
  await button.click(); await page.getByRole("button", { name: "Back to formats", exact: true }).click(); await expect(button).toBeFocused();
});

test("template signup snapshots remain isolated and explicit cancellation clears only the source draft", async ({ page }) => {
  await page.goto("/quote-template/ecommerce-website");
  await page.getByRole("link", { name: "Factors to consider in determining your pricing", exact: true }).click();
  const email = page.getByRole("textbox", { name: "Email address" });
  await email.fill("template@example.test");
  await page.locator(".template-customize form").evaluate((form: HTMLFormElement) => { form.requestSubmit(); form.requestSubmit(); });
  await expect(page.locator(".template-handoff-summary")).toContainText("quote-template--ecommerce-website");
  await page.goBack(); await expect(email).toHaveValue("template@example.test");
  await page.goForward(); await expect(page.locator("main")).toContainText("template@example.test");
  await page.getByRole("link", { name: "Back to landing", exact: true }).click();
  await page.getByRole("button", { name: "Templates", exact: true }).click();
  await page.locator("#public-mega-menu").getByRole("link", { name: "All Templates", exact: true }).click();
  await expect(page.locator(".template-card")).toHaveCount(24);
  await page.locator(".template-card").first().click(); await page.getByRole("link", { name: "Get template", exact: true }).click();
  await expect(page.locator(".template-handoff-summary")).toContainText("invoice-template--itemized-bill");
  await page.goBack(); await page.goBack(); await page.goBack(); await page.goBack();
  await expect(page.locator(".template-handoff-summary")).toContainText("quote-template--ecommerce-website");
  await page.getByRole("button", { name: "Cancel and clear draft" }).click();
  await page.getByRole("link", { name: "Factors to consider in determining your pricing", exact: true }).click();
  await expect(email).toHaveValue("");
  await page.goto("/signup"); await expect(page.locator(".template-handoff-summary")).toHaveCount(0);
});

test("template failure retry and the latest slow filter win without an external request", async ({ page }) => {
  await page.goto("/components"); await page.getByText("Preview controls", { exact: true }).click();
  await page.getByRole("combobox", { name: "Scenario", exact: true }).selectOption("read-error");
  await page.getByRole("link", { name: "Public", exact: true }).click();
  await page.getByRole("button", { name: "Templates", exact: true }).click(); await page.locator("#public-mega-menu").getByRole("link", { name: "All Templates", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("could not be loaded");
  await page.getByRole("button", { name: "Try again", exact: true }).click(); await expect(page.locator(".template-card")).toHaveCount(24);
  // 이유 : 카드 개수만 준비된 뒤 문서를 이탈하면 아직 로딩 중인 로컬 썸네일이 취소되어 네트워크 검증을 흐린다.
  await expect.poll(() => page.locator(".template-card img").evaluateAll(images => images.filter(image => image.getBoundingClientRect().top < innerHeight).every(image => image.complete && image.naturalWidth > 0))).toBe(true);
  await page.waitForLoadState("networkidle");
  await page.goto("/components"); await page.getByText("Preview controls", { exact: true }).click(); await page.getByRole("combobox", { name: "Scenario", exact: true }).selectOption("slow");
  await page.getByRole("link", { name: "Public", exact: true }).click(); await page.getByRole("button", { name: "Templates", exact: true }).click(); await page.locator("#public-mega-menu").getByRole("link", { name: "All Templates", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Loading templates");
  await page.getByRole("searchbox").fill("rental"); await expect(page).toHaveURL(/q=rental/);
  await page.getByRole("searchbox").fill("zoho"); await expect(page.locator(".template-card h2")).toHaveText("Zoho Invoice Template");
  await page.waitForTimeout(1600); await expect(page.locator(".template-card h2")).toHaveText("Zoho Invoice Template");
  await page.goto("/components"); await page.getByText("Preview controls", { exact: true }).click(); await page.getByRole("combobox", { name: "Scenario", exact: true }).selectOption("normal");
});

test("narrow template layouts, keyboard, invalid input and synthetic composition remain usable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 600 });
  for (const path of ["/templates", "/invoice-template", "/quote-template/ecommerce-website"]) {
    await page.goto(path); await expect(page.locator("h1")).toBeVisible();
    const clipped = await page.locator("h1, main h2, main h3, main input, main .public-button").evaluateAll(elements => elements.filter(element => { const r = element.getBoundingClientRect(); return r.width > 0 && (r.left < -1 || r.right > innerWidth + 1); }).map(element => element.textContent));
    expect(clipped).toEqual([]);
  }
  const toc = page.getByRole("link", { name: "Factors to consider in determining your pricing", exact: true });
  await toc.focus(); await page.keyboard.press("Enter"); await expect(page.locator("#quote-section-2")).toBeInViewport();
  const email = page.getByRole("textbox", { name: "Email address" }); await email.fill("입력오류".repeat(40)); await page.getByRole("button", { name: "Customize", exact: true }).click(); await expect(page.getByRole("alert")).toBeVisible();
  await email.fill("test@example.test"); await email.dispatchEvent("compositionstart"); await email.press("Enter"); await expect(page).toHaveURL(/quote-template/); await email.dispatchEvent("compositionend");
  await page.getByRole("button", { name: "Customize", exact: true }).click(); await expect(page.locator("main")).toContainText("test@example.test");
});

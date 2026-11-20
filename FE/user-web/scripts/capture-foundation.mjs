import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repository = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const output = path.join(repository, "TODO/BONSAI_FE_MOCK_PLAN/RESULTS/evidence/g02-foundation-regression");
const baseURL = process.env.PREVIEW_URL ?? "http://127.0.0.1:5173";
if (!["127.0.0.1", "localhost"].includes(new URL(baseURL).hostname)) throw new Error("Local preview URL required");
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(baseURL);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(output, "g01-public.png") });
  await page.goto(new URL("/components", baseURL).href);
  await page.screenshot({ path: path.join(output, "g01-components.png") });
  await page.getByRole("button", { name: "Add Client", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await page.screenshot({ path: path.join(output, "g01-dialog.png") });
  const metrics = {
    browser: await browser.version(), viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1,
    source: "sc_3e2640e1d9ca4b59a7f1c79cb628a502", sourceScope: "shared primitives only",
    dialog: await dialog.boundingBox(), field: await dialog.locator(".field").boundingBox(),
    input: await dialog.getByRole("textbox", { name: "Company Name" }).boundingBox(),
    button: await dialog.getByRole("button", { name: "Add Client" }).boundingBox(),
    // 기능 : 실제 렌더링된 요소의 폰트·간격·색상 값을 비교 근거로 수집한다.
    styles: await dialog.evaluate(function measureDialog(element) {
      const input = element.querySelector("input");
      const button = element.querySelector(".dialog__footer button");
      const heading = element.querySelector("h2");
      if (!input || !button || !heading) throw new Error("Missing reference controls");
      const fieldStyle = getComputedStyle(input), buttonStyle = getComputedStyle(button), titleStyle = getComputedStyle(heading);
      return { font: fieldStyle.fontFamily, fontSize: fieldStyle.fontSize, lineHeight: fieldStyle.lineHeight,
        inputBorder: fieldStyle.borderColor, inputRadius: fieldStyle.borderRadius,
        buttonBackground: buttonStyle.backgroundImage, buttonWeight: buttonStyle.fontWeight,
        headingSize: titleStyle.fontSize, headingWeight: titleStyle.fontWeight, headingLine: titleStyle.lineHeight };
    }),
  };
  await dialog.locator(".field").screenshot({ path: path.join(output, "g01-field.png") });
  await dialog.getByRole("button", { name: "Add Client" }).screenshot({ path: path.join(output, "g01-button.png") });
  await page.keyboard.press("Escape");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Add Client", exact: true }).click();
  await page.screenshot({ path: path.join(output, "g01-dialog-narrow.png") });
  await page.keyboard.press("Escape");
  await page.getByRole("link", { name: "Log in", exact: true }).click();
  await page.getByRole("button", { name: "Continue as Alex" }).click();
  await page.getByRole("link", { name: /Design Resources View item/ }).click();
  await page.getByRole("button", { name: "Edit name" }).click();
  await page.getByRole("textbox", { name: "Name", exact: true }).fill("한글로 입력한 긴 미리보기 항목 이름 ".repeat(10));
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await page.getByRole("dialog").waitFor({ state: "detached" });
  // 이유 : 전체 페이지 캡처의 원점을 맞춰 화면 밖의 고정 skip 링크가 이미지에 나타나는 현상을 피한다.
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: path.join(output, "g01-narrow-long-text.png"), fullPage: true });
  // 검증 도구의 장애·세션 상태는 캡처 종료 전에 정상 초기값으로 복원한다.
  await page.getByText("Preview controls", { exact: true }).click();
  await page.getByRole("button", { name: "Reset preview" }).click();
  await page.waitForURL(baseURL + "/components");
  await writeFile(path.join(output, "g01-visual-metrics.json"), JSON.stringify({ ...metrics, errors }, null, 2));
  if (errors.length) throw new Error("Browser errors occurred");
  process.stdout.write(JSON.stringify({ output, ...metrics }) + "\n");
} finally {
  await browser.close();
}

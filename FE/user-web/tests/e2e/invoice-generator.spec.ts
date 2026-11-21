import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";

// 기능 : 실제 생성기 입력으로 원본 계산 표본을 구성한다.
async function fillObservedInvoice(page: Page) {
  await page.getByRole("textbox", { name: "Client Name:" }).fill("Jane Studio");
  await page.getByRole("textbox", { name: "Client Address:" }).fill("1226 University Dr, Menlo Park, CA 94025, USA");
  await page.getByRole("textbox", { name: "Description 1", exact: true }).fill("Poster Design");
  await page.getByRole("spinbutton", { name: "Quantity 1", exact: true }).fill("1");
  await page.getByRole("spinbutton", { name: "Unit price 1", exact: true }).fill("10");
}

test("invoice template → generator calculates the observed amounts, blank rows and removal with actual history", async ({ page }) => {
  await page.goto("/invoice-template"); await page.getByRole("link", { name: /Try our Online Invoice Generator/ }).click();
  await expect(page.locator("h1")).toHaveText("Invoice Generator"); await fillObservedInvoice(page);
  await expect(page.getByTestId("invoice-subtotal")).toHaveText("10.00"); await expect(page.getByTestId("invoice-tax")).toHaveText("1.50"); await expect(page.getByTestId("invoice-total")).toHaveText("11.50");
  await page.getByRole("button", { name: "Add Item", exact: true }).click(); await expect(page.getByRole("textbox", { name: "Description 2", exact: true })).toBeFocused();
  await expect(page.getByTestId("invoice-total")).toHaveText("11.50");
  await page.getByRole("button", { name: "Remove item 1", exact: true }).click(); await expect(page.getByTestId("invoice-total")).toHaveText("0");
  await page.getByRole("button", { name: "Remove item 1", exact: true }).click(); await expect(page.getByRole("button", { name: "Add Item", exact: true })).toBeFocused();
  await page.getByRole("button", { name: "Download Invoice", exact: true }).click(); await expect(page.getByRole("alert")).toContainText("Add at least one complete item");
  await page.getByRole("button", { name: "Add Item", exact: true }).click(); await fillObservedInvoice(page);
  await page.goBack(); await expect(page.locator("h1")).toHaveText("Invoice Template"); await page.goForward(); await expect(page.getByTestId("invoice-total")).toHaveText("11.50");
  await page.reload(); await expect(page.getByRole("textbox", { name: "Client Name:" })).toHaveValue(""); await expect(page.getByTestId("invoice-total")).toHaveText("0");
});

test("validation preserves drafts and the signup handoff is a snapshot rather than a PDF", async ({ page }) => {
  let downloads = 0; page.on("download", () => downloads++);
  await page.goto("/invoice-generator"); await fillObservedInvoice(page);
  await page.getByRole("spinbutton", { name: "Unit price 1", exact: true }).fill("-1"); await page.getByRole("button", { name: "Download Invoice", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("unit price"); await expect(page.getByRole("textbox", { name: "Description 1", exact: true })).toHaveValue("Poster Design");
  await page.getByRole("spinbutton", { name: "Unit price 1", exact: true }).fill("0.01"); await page.getByRole("spinbutton", { name: "Quantity 1", exact: true }).fill("0.5");
  await expect(page.getByTestId("invoice-total")).toHaveText("0.01"); await page.getByLabel("Due Date:").fill("2024-02-29");
  await page.locator("form.invoice-generator").evaluate((form: HTMLFormElement) => { form.requestSubmit(); form.requestSubmit(); });
  await expect(page).toHaveURL("/signup"); await expect(page.locator(".invoice-handoff-summary")).toContainText("Total: 0.01"); await expect(page.locator(".invoice-handoff-summary")).toContainText("PDF 파일을 생성하거나 내려받지 않았으며");
  await page.goBack(); await page.getByRole("spinbutton", { name: "Unit price 1", exact: true }).fill("20"); await page.goForward();
  await expect(page.locator(".invoice-handoff-summary")).toContainText("Total: 0.01");
  await page.getByRole("button", { name: "Back to invoice", exact: true }).click(); await expect(page.getByRole("spinbutton", { name: "Unit price 1", exact: true })).toHaveValue("20");
  await expect(page.getByLabel("Due Date:")).toHaveValue("2024-02-29"); expect(downloads).toBe(0);
});

test("failed and cancelled local handoffs retain inputs and cannot navigate after editing or leaving", async ({ page }) => {
  await page.goto("/components"); await page.getByText("Preview controls", { exact: true }).click(); await page.getByRole("combobox", { name: "Scenario", exact: true }).selectOption("write-error");
  await page.getByRole("link", { name: "Public", exact: true }).click(); await page.getByRole("button", { name: "Templates", exact: true }).click(); await page.getByRole("tab", { name: "Invoice Templates" }).click(); await page.getByRole("tabpanel").getByRole("link", { name: "Online Invoice Generator", exact: true }).click();
  await fillObservedInvoice(page); await page.getByRole("button", { name: "Download Invoice", exact: true }).click(); await expect(page.getByRole("alert")).toContainText("Your invoice is still here");
  await expect(page.getByTestId("invoice-total")).toHaveText("11.50"); await page.getByRole("button", { name: "Download Invoice", exact: true }).click(); await expect(page).toHaveURL("/signup");
  await page.goto("/components"); await page.getByText("Preview controls", { exact: true }).click(); await page.getByRole("combobox", { name: "Scenario", exact: true }).selectOption("slow");
  await page.getByRole("link", { name: "Public", exact: true }).click(); await page.getByRole("button", { name: "Templates", exact: true }).click(); await page.getByRole("tab", { name: "Invoice Templates" }).click(); await page.getByRole("tabpanel").getByRole("link", { name: "Online Invoice Generator", exact: true }).click();
  await fillObservedInvoice(page); await page.getByRole("button", { name: "Download Invoice", exact: true }).click(); await page.getByRole("button", { name: "Cancel", exact: true }).click(); await page.waitForTimeout(1600); await expect(page).toHaveURL("/invoice-generator");
  await page.getByRole("button", { name: "Download Invoice", exact: true }).click(); await page.getByRole("spinbutton", { name: "Unit price 1", exact: true }).fill("25"); await page.waitForTimeout(1600); await expect(page).toHaveURL("/invoice-generator"); await expect(page.getByTestId("invoice-total")).toHaveText("28.75");
  await page.getByRole("button", { name: "Download Invoice", exact: true }).click(); await page.locator("header").getByRole("link", { name: "Bonsai home", exact: true }).click(); await page.waitForTimeout(1600); await expect(page).toHaveURL("/");
  await page.goto("/components"); await page.getByText("Preview controls", { exact: true }).click(); await page.getByRole("combobox", { name: "Scenario", exact: true }).selectOption("normal");
});

test("narrow generator supports long Korean, keyboard and synthetic composition without clipped fields", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 600 }); await page.goto("/invoice-generator"); await fillObservedInvoice(page);
  const name = page.getByRole("textbox", { name: "Client Name:" }); await name.fill("긴 한국어 이름과 조합 입력 ".repeat(10)); await name.dispatchEvent("compositionstart"); await name.press("Enter"); await expect(page).toHaveURL("/invoice-generator"); await name.dispatchEvent("compositionend");
  const clipped = await page.locator("h1, .invoice-generator input, .invoice-generator textarea, .invoice-generator button").evaluateAll(elements => elements.filter(element => { const r = element.getBoundingClientRect(); return r.left < -1 || r.right > innerWidth + 1; }).map(element => element.tagName)); expect(clipped).toEqual([]);
  await page.setViewportSize({ width: 320, height: 600 });
  await page.getByRole("spinbutton", { name: "Quantity 1", exact: true }).fill("1000000"); await page.getByRole("spinbutton", { name: "Unit price 1", exact: true }).fill("1000000");
  await expect(page.getByTestId("invoice-total")).toHaveText("1150000000000.00");
  expect(await page.locator(".invoice-generator-table tbody td, .invoice-generator-table tfoot td").evaluateAll(elements => elements.every(element => element.scrollWidth <= element.clientWidth + 1))).toBe(true);
  await page.getByRole("button", { name: "Add Item", exact: true }).focus(); await page.keyboard.press("Enter"); await expect(page.getByRole("textbox", { name: "Description 2", exact: true })).toBeFocused();
  await page.getByRole("button", { name: "Download Invoice", exact: true }).click(); await expect(page).toHaveURL("/signup"); await expect(page.locator(".invoice-handoff-summary")).toContainText("Poster Design");
});

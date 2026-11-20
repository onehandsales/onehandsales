import { test, expect } from "./fixtures";

test("older signup history resolves its own draft and return page after a second introduction handoff", async ({ page }) => {
  await page.goto("/crm");
  await page.getByRole("textbox", { name: "Email address" }).fill("first-crm@example.test");
  await page.locator("form").getByRole("button", { name: "Start free", exact: true }).click();
  await expect(page.locator("main")).toContainText("first-crm@example.test");
  await page.getByRole("button", { name: "Industries", exact: true }).click();
  await page.locator("#public-mega-menu").getByRole("link", { name: "Consulting", exact: true }).click();
  await page.getByRole("textbox", { name: "Email address" }).fill("second-consulting@example.test");
  await page.locator("form").getByRole("button", { name: "Start free", exact: true }).click();
  await expect(page.locator("main")).toContainText("second-consulting@example.test");
  await page.goBack(); await page.goBack();
  await expect(page.locator("main")).toContainText("first-crm@example.test");
  await expect(page.locator("main")).not.toContainText("second-consulting@example.test");
  await page.locator("header").getByRole("link", { name: "Start free", exact: true }).click();
  await expect(page.locator("main")).toContainText("first-crm@example.test");
  await page.getByRole("button", { name: "Cancel and clear draft" }).click();
  await expect(page).toHaveURL("/crm");
  await expect(page.getByRole("textbox", { name: "Email address" })).toHaveValue("");
});

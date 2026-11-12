import { expect, test } from "@playwright/test";
import { DATA_OBJECT_PATH, setupViewDataScenario } from "./support/view-data-scenario";

test("both add buttons open a draft, cancel creates nothing, save sends typed initial values", async ({ page }) => {
  const state = await setupViewDataScenario(page); state.references = true;
  await page.goto(DATA_OBJECT_PATH);
  await page.getByRole("button", { name: "기록 추가", exact: true }).last().click();
  await expect(page.getByRole("dialog", { name: "회사 기록 추가" })).toBeVisible();
  expect(state.writes).toEqual([]);
  await page.getByRole("button", { name: "취소", exact: true }).click();
  expect(state.added).toBe(0);
  await page.getByRole("button", { name: "기록 추가", exact: true }).first().click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("textbox", { name: "회사명", exact: true }).fill("신규 영업");
  await dialog.getByRole("textbox", { name: "금액", exact: true }).fill("9007199254740992.0000000002");
  await dialog.getByRole("combobox", { name: "대상 회사", exact: true }).selectOption({ label: "SAMSUNG" });
  await page.screenshot({ path: "test-results/record-create-dialog.png" });
  state.delayWrite = true;
  await dialog.getByRole("button", { name: "저장", exact: true }).click();
  await expect(dialog.getByRole("button", { name: "저장 중…", exact: true })).toBeDisabled();
  await expect(dialog).toHaveCount(0);
  expect(state.writes).toHaveLength(1);
  expect(state.writes[0]?.body).toEqual({ creationId: expect.stringMatching(/^[0-9a-f-]{36}$/), values: [
    { attributeDefinitionId: "name", values: ["신규 영업"] },
    { attributeDefinitionId: "amount", values: ["9007199254740992.0000000002"] },
    { attributeDefinitionId: "company", values: [{ targetRecordDefinitionId: "company-samsung" }] },
  ] });
});

test("lost creation response keeps the draft and retries with the same creation ID", async ({ page }) => {
  const state = await setupViewDataScenario(page); state.recordResponseLost = true;
  await page.goto(DATA_OBJECT_PATH);
  await page.getByRole("button", { name: "기록 추가", exact: true }).first().click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("textbox", { name: "회사명", exact: true }).fill("재시도 영업");
  await dialog.getByRole("button", { name: "저장", exact: true }).click();
  await expect(dialog.getByRole("alert")).toBeVisible();
  await expect(dialog.getByRole("textbox", { name: "회사명", exact: true })).toHaveValue("재시도 영업");
  await dialog.getByRole("button", { name: "저장", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  expect(state.writes).toHaveLength(2);
  expect(state.writes[0]?.body).toEqual(state.writes[1]?.body);
  expect(state.added).toBe(1);
});

for (const type of ["TABLE", "KANBAN", "LIST"]) {
  test(`${type} edits direct Record references by name and retains failed edits`, async ({ page }) => {
    const state = await setupViewDataScenario(page); state.references = true;
    state.sources[`view-${type.toLowerCase()}`] = "OBJECT";
    await page.goto(`/app/workspaces/workspace-e2e-001/view-definitions/view-${type.toLowerCase()}`);
    await page.getByRole("button", { name: "대상 회사 수정", exact: true }).first().click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("combobox", { name: "대상 회사", exact: true }).selectOption({ label: "SAMSUNG" });
    state.recordError = 500;
    await dialog.getByRole("button", { name: "저장", exact: true }).click();
    await expect(dialog.getByRole("alert")).toBeVisible();
    await expect(dialog.getByRole("combobox", { name: "대상 회사", exact: true })).toHaveValue("company-samsung");
    state.recordError = 0;
    await dialog.getByRole("button", { name: "저장", exact: true }).click();
    await expect(dialog).toHaveCount(0);
    expect(state.writes.at(-1)).toMatchObject({ method: "PATCH", path: expect.stringContaining("/record-definitions/record-0/record-attribute-values-definitions/company-record-0"), body: { value: { targetRecordDefinitionId: "company-samsung" } } });
    expect(state.requests.length).toBeGreaterThan(1);
  });
}

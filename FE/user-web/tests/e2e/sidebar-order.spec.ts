import { expect, test, type Page } from "@playwright/test";
import { seedAuthenticatedSession, setupUserWebApiMocks } from "./support/user-web-api-mocks";

const names = { objects: "관리 대상", lists: "업무 목록", "view-favorites": "즐겨찾기" } as const;
type Section = keyof typeof names;
const sections = Object.keys(names) as Section[];

// 기능 : 저장된 순서를 GET에 반영하는 API mock으로 실제 사용자 동작을 검증합니다.
async function prepare(page: Page) {
  await setupUserWebApiMocks(page, {
    store: { createdWorkspace: { id: "workspace-e2e-002", kind: "PERSONAL", name: "두 번째 작업 공간" } },
  });
  const records: Record<Section, Record<string, string | null>[]> = {
    objects: ["회사", "고객", "매물"].map((name, i) => ({ id: "object-" + i, singularName: name, pluralName: name, icon: "lucide:building-2" })),
    lists: ["영업 파이프라인", "제안", "계약"].map((name, i) => ({ id: "list-" + i, name, icon: "lucide:list" })),
    "view-favorites": ["전체 영업", "단계별 영업", "전체 매물"].map((name, i) => ({ id: "favorite-" + i, viewDefinitionId: "view-" + i, name, icon: "lucide:table-2" })),
  };
  const writes: { section: Section; ids: string[] }[] = [];
  const settings = { failure: 0, delay: 0 };
  await page.route(/\/api\/users\/me\/sidebar\/workspaces\/[^/]+\/(objects|lists|view-favorites)(\/order)?$/, async route => {
    const path = new URL(route.request().url()).pathname;
    const section = path.split("/").filter(Boolean).at(path.endsWith("/order") ? -2 : -1) as Section;
    if (route.request().method() === "GET") {
      const secondWorkspace = path.includes("/workspace-e2e-002/");
      return route.fulfill({ json: secondWorkspace
        ? section === "objects" ? [{ id: "second-object", singularName: "새 공간 항목", pluralName: "새 공간 항목", icon: null }] : []
        : records[section] });
    }
    const { orderedIds } = route.request().postDataJSON() as { orderedIds: string[] };
    writes.push({ section, ids: orderedIds });
    expect(route.request().headers().authorization).toBeTruthy();
    if (settings.delay) await new Promise(resolve => setTimeout(resolve, settings.delay));
    if (settings.failure) return route.fulfill({ status: settings.failure, json: { statusCode: settings.failure, error: "SidebarOrderConflict", message: "test failure" } });
    records[section] = orderedIds.map(id => records[section].find(row => row.id === id)!);
    return route.fulfill({ json: { items: orderedIds.map((id, sortOrder) => ({ id, sortOrder })) } });
  });
  await seedAuthenticatedSession(page);
  await page.goto("/app/workspaces/workspace-e2e-001");
  await expect(page.getByRole("list", { name: names.objects, exact: true }).getByRole("listitem")).toHaveCount(3);
  return { records, writes, settings };
}

// 기능 : native mouse drag의 놓은 위치를 행 아래쪽으로 지정합니다.
async function moveFirstToLast(page: Page, section: Section) {
  const list = page.getByRole("list", { name: names[section], exact: true });
  await list.getByRole("listitem").first().dragTo(list.getByRole("listitem").last(), {
    sourcePosition: { x: 60, y: 15 }, targetPosition: { x: 60, y: 27 },
  });
}

for (const section of sections) {
  test(`${section}: mouse drop saves its own IDs and survives reload`, async ({ page }) => {
    const api = await prepare(page);
    const before = api.records[section].map(item => item.id);
    await moveFirstToLast(page, section);
    await expect.poll(() => api.writes.length).toBe(1);
    expect(api.writes[0]).toEqual({ section, ids: [before[1], before[2], before[0]] });
    const list = page.getByRole("list", { name: names[section], exact: true });
    await expect(list).not.toHaveAttribute("aria-busy", "true");
    expect(new URL(page.url()).pathname).toBe("/app/workspaces/workspace-e2e-001");
    await page.reload();
    await expect.poll(() => list.getByRole("listitem").evaluateAll(rows => rows.map(row => row.getAttribute("data-sidebar-item-id"))))
      .toEqual([before[1], before[2], before[0]]);
    if (section === "objects") {
      await list.getByRole("listitem").first().hover();
      await page.getByRole("navigation", { name: "Workspace navigation" }).screenshot({ path: test.info().outputPath("sidebar-after-reorder.png") });
    }
  });

  test(`${section}: native drag accepts row gaps in both directions`, async ({ page }) => {
    const api = await prepare(page);
    const before = api.records[section].map(item => item.id);
    const list = page.getByRole("list", { name: names[section], exact: true });
    const rows = list.getByRole("listitem");
    const line = page.getByTestId("sidebar-order-indicator");
    // 실제 빈틈을 대상으로 받은 dragover가 React 처리 후 허용됐는지 관찰한다.
    await list.evaluate(element => {
      window.addEventListener("dragover", event => {
        if (event.target !== element) return;
        (element as HTMLElement).dataset.gapAccepted = String(event.defaultPrevented);
        (element as HTMLElement).dataset.gapDropEffect = event.dataTransfer?.dropEffect;
      });
    });

    // 기능 : 행이 아닌 1px 빈틈에 마우스를 놓아 실제 native drop을 검증합니다.
    async function dropInGap(sourceIndex: number, upperIndex: number) {
      const source = (await rows.nth(sourceIndex).boundingBox())!;
      const upper = (await rows.nth(upperIndex).boundingBox())!;
      const lower = (await rows.nth(upperIndex + 1).boundingBox())!;
      // Chromium은 소수점 좌표를 다음 행으로 판정할 수 있어 빈틈의 실제 픽셀을 사용한다.
      const gap = { x: upper.x + 60, y: upper.y + upper.height };
      expect(await page.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.getAttribute("role"), gap)).toBe("list");
      await list.evaluate(element => {
        delete (element as HTMLElement).dataset.gapAccepted;
        delete (element as HTMLElement).dataset.gapDropEffect;
      });
      await page.mouse.move(source.x + 60, source.y + source.height / 2);
      await page.mouse.down();
      await page.mouse.move(source.x + 68, source.y + source.height / 2, { steps: 2 });
      await page.mouse.move(gap.x, upper.y + upper.height - 3, { steps: 8 });
      await page.mouse.move(gap.x, gap.y);
      await page.mouse.move(gap.x + 1, gap.y);
      await expect(list).toHaveAttribute("data-gap-accepted", "true");
      await expect(list).toHaveAttribute("data-gap-drop-effect", "move");
      await expect(line).toHaveCount(1);
      await expect(line).toHaveCSS("height", "4px");
      await expect(line).toHaveCSS("background-color", "rgb(72, 128, 238)");
      const gapY = (await line.boundingBox())!.y;
      await page.mouse.move(gap.x, lower.y + 3);
      expect((await line.boundingBox())!.y).toBe(gapY);
      await page.mouse.move(gap.x, gap.y);
      await page.mouse.up();
    }

    await dropInGap(0, 1);
    await expect.poll(() => api.writes.length).toBe(1);
    expect(api.writes[0]).toEqual({ section, ids: [before[1], before[0], before[2]] });
    await expect(list).not.toHaveAttribute("aria-busy", "true");
    await dropInGap(2, 0);
    await expect.poll(() => api.writes.length).toBe(2);
    expect(api.writes[1]).toEqual({ section, ids: [before[1], before[2], before[0]] });
    await expect(line).toHaveCount(0);
    expect(new URL(page.url()).pathname).toBe("/app/workspaces/workspace-e2e-001");
  });
}

test("keyboard cancel does not save; keyboard move persists without navigation", async ({ page }) => {
  const api = await prepare(page);
  const handle = page.getByRole("button", { name: "회사 순서 이동", exact: true });
  await handle.focus(); await handle.press("Space"); await handle.press("ArrowDown"); await handle.press("Escape");
  expect(api.writes).toHaveLength(0);
  const list = page.getByRole("list", { name: names.objects, exact: true });
  await expect(list.getByRole("listitem").first()).toHaveAttribute("data-sidebar-item-id", "object-0");
  await handle.press("Space"); await handle.press("ArrowDown"); await handle.press("Enter");
  await expect.poll(() => api.writes.length).toBe(1);
  expect(api.writes[0]?.ids).toEqual(["object-1", "object-0", "object-2"]);
  await expect(list).not.toHaveAttribute("aria-busy", "true");
  await list.getByRole("link", { name: "회사", exact: true }).click();
  await expect(page).toHaveURL(/\/objects\/object-0$/);
});

for (const failure of [409, 500]) {
  test(`failure ${failure} restores current server order`, async ({ page }) => {
    const api = await prepare(page); api.settings.failure = failure;
    await moveFirstToLast(page, "lists");
    await expect(page.getByRole("alert")).toContainText(failure === 409 ? "목록이 변경되었어요" : "순서를 저장하지 못했어요");
    const list = page.getByRole("list", { name: names.lists, exact: true });
    await expect.poll(() => list.getByRole("listitem").evaluateAll(rows => rows.map(row => row.getAttribute("data-sidebar-item-id"))))
      .toEqual(["list-0", "list-1", "list-2"]);
    await expect(list).not.toHaveAttribute("aria-busy", "true");
    api.settings.failure = 0;
    await moveFirstToLast(page, "lists");
    await expect.poll(() => api.writes.length).toBe(2);
    await expect(page.getByRole("alert")).toHaveCount(0);
  });
}

test("cross-section drop is ignored and saving blocks repeated drag", async ({ page }) => {
  const api = await prepare(page);
  const objects = page.getByRole("list", { name: names.objects, exact: true });
  const lists = page.getByRole("list", { name: names.lists, exact: true });
  await objects.getByRole("listitem").first().dragTo(lists.getByRole("listitem").last());
  expect(api.writes).toHaveLength(0);
  api.settings.delay = 1000;
  await moveFirstToLast(page, "objects");
  await expect(objects).toHaveAttribute("aria-busy", "true");
  await expect(objects.getByRole("listitem").first()).toHaveAttribute("draggable", "false");
  await expect(objects.getByRole("button").first()).toBeDisabled();
  await expect(objects).not.toHaveAttribute("aria-busy", "true");
  expect(api.writes).toHaveLength(1);
});

test("late save response stays in its original workspace cache", async ({ page }) => {
  const api = await prepare(page);
  api.settings.delay = 2000;
  await moveFirstToLast(page, "objects");
  const list = page.getByRole("list", { name: names.objects, exact: true });
  await expect(list).toHaveAttribute("aria-busy", "true");
  await page.getByRole("button", { name: "E2E Workspace" }).click();
  await page.getByRole("menuitem", { name: "두 번째 작업 공간", exact: true }).click();
  await expect(page).toHaveURL(/\/workspaces\/workspace-e2e-002$/);
  await expect(list.getByRole("listitem")).toHaveCount(1);
  await expect(list.getByRole("listitem")).toHaveAttribute("data-sidebar-item-id", "second-object");
  await expect.poll(() => api.records.objects[0]?.id).toBe("object-1");
  await expect(list.getByRole("listitem")).toHaveAttribute("data-sidebar-item-id", "second-object");
  await expect(list).not.toHaveAttribute("aria-busy", "true");
  await page.getByRole("button", { name: "두 번째 작업 공간" }).click();
  await page.getByRole("menuitem", { name: "E2E Workspace", exact: true }).click();
  await expect.poll(() => list.getByRole("listitem").evaluateAll(rows => rows.map(row => row.getAttribute("data-sidebar-item-id"))))
    .toEqual(["object-1", "object-2", "object-0"]);
});

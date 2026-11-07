import assert from "node:assert/strict";
import { readFile, writeFile, mkdir, mkdtemp, copyFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, URL } from "node:url";
import { chromium } from "@playwright/test";
import {
  setupUserWebApiMocks,
  seedAuthenticatedSession,
} from "../tests/e2e/support/user-web-api-mocks.ts";

// Node 24: node scripts/capture-public-product.mjs
// Requires User Web at http://localhost:5173 and installed Google Chrome.
// All application APIs are intercepted by the existing E2E mock helper.
// No UI elements are injected or restyled, and no backend data is written.
const root = fileURLToPath(new URL("../", import.meta.url));
const baseURL = "http://localhost:5173";
const fixtures = JSON.parse(await readFile(new URL("./fixtures/public-product-scenarios.json", import.meta.url), "utf8"));
const outputDirectory = path.join(root, "public/public-site/product");
const stagingDirectory = await mkdtemp(path.join(tmpdir(), "onehand-product-capture-"));
const workspaceId = "workspace-e2e-001";
const objectId = "object-definition-company";
const widths = [230, 235, 180, 425];

// 기능 : 업무 목록에 소속된 예시 기록과 각 목록 항목의 값을 구성합니다.
function createItems(scenario) {
  assert.equal(scenario.labels.length, 4);
  assert.equal(scenario.fieldScopes.length, scenario.labels.length);
  return scenario.rows.map((row, index) => {
    assert.equal(row.length, 4);
    const recordId = `capture-record-${index}`;
    const entryId = `capture-entry-${index}`;
    return {
      itemKey: `LIST_ENTRY:${entryId}`,
      occurrenceKey: entryId,
      recordDefinitionId: recordId,
      objectDefinitionId: objectId,
      listEntryDefinitionId: entryId,
      title: row[0],
      groupPath: [],
      cells: row.map((value, column) => ({
        bindingId: `field-${column}`,
        state: value === null ? "EMPTY" : "VALUE",
        values: value === null ? [] : [{
          valueDefinitionId: `capture-value-${index}-${column}`,
          sourceEntity: {
            kind: scenario.fieldScopes[column],
            id: scenario.fieldScopes[column] === "LIST_ENTRY" ? entryId : recordId,
          },
          value,
        }],
      })),
    };
  });
}

// 기능 : 실제 업무 목록 칸반의 조회 계약에 맞춰 단계와 목록 항목을 구성합니다.
function createViewData(scenario, viewId, listId) {
  const items = createItems(scenario);
  const bindings = scenario.labels.map((label, index) => ({
    id: `field-${index}`,
    attributeDefinitionId: index ? `attribute-${index}` : "name",
    sourceScope: scenario.fieldScopes[index],
    referenceAttributeIdPath: [],
    role: index ? "DISPLAY" : "TITLE",
    label,
    attributeType: "Text",
    isMultiselect: false,
    isHidden: false,
    width: widths[index],
    format: null,
    currencyCode: null,
  }));
  const indexes = scenario.groups.flatMap(group => group.rowIndexes);
  assert.deepEqual([...indexes].sort((a, b) => a - b), items.map((_, index) => index));
  const columns = scenario.groups.map((group, index) => ({
    key: `stage-${index}`, parentKey: null, label: group.label,
    color: null, count: group.rowIndexes.length, isHidden: false, isFold: false,
    groupToken: `sample-${index}`, items: group.rowIndexes.map(rowIndex => items[rowIndex]),
    pageInfo: { hasNextPage: false, nextCursor: null }, calculations: [],
  }));
  return {
    viewDefinitionId: viewId,
    viewType: "KANBAN",
    viewName: scenario.viewName,
    source: { kind: "LIST", objectDefinitionId: null, listDefinitionId: listId, itemKind: "LIST_ENTRY" },
    configurationFingerprint: `public-work-list-kanban-${listId}-v3`,
    issues: [], bindings,
    summary: { sourceItemCount: items.length, matchedItemCount: items.length, eligibleItemCount: items.length },
    state: "READY", part: "MAIN",
    data: {
      presentation: { cardDensity: null, showEmptyGroups: null },
      groupDefinitionId: "list-status", unassignedCount: 0, columns,
    },
  };
}

// 기능 : 캡처 브라우저에만 예시 계정과 업무 데이터를 연결합니다.
async function preparePage(page, scenario, locale, scene) {
  // 1. 기존 E2E 도우미로 모든 앱 API를 가로채고 가상 로그인 상태를 준비한다.
  const korean = locale === "ko";
  const viewId = `view-kanban-${scene}`;
  const listId = `capture-list-${scene}`;
  const headerRequests = [];
  const dataRequests = [];
  const workspace = {
    id: workspaceId,
    name: korean ? "OneHand CRM · 예시 데이터" : "OneHand CRM · Sample data",
    kind: "PERSONAL",
  };
  await setupUserWebApiMocks(page, { store: {
    createdWorkspace: workspace,
    sidebarCrmLists: Object.entries(fixtures[locale]).map(([key, value]) => ({
      id: `capture-list-${key}`, name: value.listName, icon: "list",
    })),
    sidebarViewFavorites: [{ id: "favorite-sample", viewDefinitionId: viewId, name: scenario.listName, icon: "list" }],
  } });
  await seedAuthenticatedSession(page);

  // 기능 : 실제 API 호출 없이 캡처용 조회 응답을 반환합니다.
  function respond(route, json) {
    const headers = {
      "access-control-allow-origin": route.request().headers().origin ?? baseURL,
      "access-control-allow-credentials": "true",
      "access-control-allow-methods": "GET, OPTIONS",
      "access-control-allow-headers": "Authorization, Content-Type, X-Request-Id",
    };
    return route.fulfill(route.request().method() === "OPTIONS" ? { status: 204, headers } : { json, headers });
  }

  // 2. 언어와 기존 사이드바·헤더에 사용할 예시 이름을 설정한다.
  const user = {
    id: "user-e2e-001", name: korean ? "김서현" : "Alex Kim", email: "demo@example.com",
    countryCode: korean ? "KR" : "US", preferredLocale: korean ? "ko-KR" : "en-US",
    timeZone: korean ? "Asia/Seoul" : "America/New_York", defaultCurrencyCode: korean ? "KRW" : "USD",
    status: "ACTIVE", platformRole: "USER", jobSelectOnboardingCompletedAt: "2026-10-01T00:00:00.000Z",
    settings: { defaultReminderMinutes: 30, sensitiveWarningEnabled: true },
  };
  await page.route(/\/api\/(me|users\/me\/profile)$/, route => respond(route, user));
  await page.route(/\/sidebar\/workspaces\/[^/]+\/objects$/, route => respond(route, [
    { id: objectId, icon: scene === "real-estate" ? "house" : scene === "b2b-field" ? "building-2" : "users-round",
      singularName: scenario.title, pluralName: scenario.title },
    { id: "object-definition-person", icon: "user-round", singularName: korean ? "담당자" : "Contacts", pluralName: korean ? "담당자" : "Contacts" },
  ]));
  await page.route(/\/view-header(?:\?.*)?$/, route => {
    if (route.request().method() === "GET") {
      const url = new URL(route.request().url());
      assert.equal(url.searchParams.get("targetType"), "LIST");
      assert.equal(url.searchParams.get("targetId"), listId);
      headerRequests.push(url.pathname);
    }
    return respond(route, {
      viewId, viewType: "KANBAN", viewName: scenario.viewName, viewIcon: null, isFavorite: true,
      objectDefinition: null, listDefinition: { id: listId, name: scenario.listName, icon: "list" },
    });
  });
  await page.route(/\/view-header\/list-definitions\/[^/]+\/view-definitions(?:\?.*)?$/, route => respond(route, {
    items: [{ viewDefinitionId: viewId, viewName: scenario.viewName, viewType: "KANBAN", viewIcon: null, isSelected: true }],
  }));

  // 3. 실제 업무 목록 화면이 LIST 조건으로 조회한 경우에만 칸반 데이터를 전달한다.
  const payload = createViewData(scenario, viewId, listId);
  await page.route(/\/view-definitions\/[^/]+\/data(?:\?.*)?$/, route => {
    if (route.request().method() === "GET") {
      const url = new URL(route.request().url());
      assert.equal(url.searchParams.get("sourceType"), "LIST");
      assert.equal(url.searchParams.get("part"), "MAIN");
      assert(url.pathname.includes(`/view-definitions/${viewId}/data`));
      dataRequests.push(url.pathname);
    }
    return respond(route, payload);
  });
  return { listId, headerRequests, dataRequests };
}

// 기능 : 실제 제품을 지정한 화면 크기로 열어 검증하고 JPG로 촬영합니다.
async function captureScene(browser, locale, scene, mobile) {
  const scenario = fixtures[locale][scene];
  const viewport = mobile
    ? { width: 390, height: scene === "overview" ? 844 : 300 }
    : { width: 1440, height: scene === "overview" ? 1000 : 584 };
  const context = await browser.newContext({
    baseURL, viewport, deviceScaleFactor: 2, locale: locale === "ko" ? "ko-KR" : "en-US",
  });
  try {
    // 1. 제품 화면을 열기 전에 예시 API와 오류 수집을 준비한다.
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    const source = await preparePage(page, scenario, locale, scene);
    const routePath = `/app/workspaces/${workspaceId}/lists/${source.listId}`;
    await page.goto(routePath);
    const content = page.locator('[data-testid="view-main-content"]:visible');
    await content.waitFor();
    await content.getByText(scenario.rows[0][0], { exact: true }).first().waitFor();

    // 2. 업무 목록 선택과 실제 칸반 렌더러, LIST 조회 및 예시 기록을 검증한다.
    await content.getByTestId("view-kanban").waitFor();
    assert.equal(await content.getByTestId("kanban-column").count(), scenario.groups.length);
    assert.equal(await content.getByTestId("kanban-card").count(), scenario.rows.length);
    assert(source.headerRequests.length > 0 && source.dataRequests.length > 0);
    if (!mobile) {
      const selectedList = page.locator(`nav[aria-label="Workspace navigation"] a[href="${routePath}"]`);
      await selectedList.waitFor();
      assert.equal(await selectedList.getAttribute("aria-current"), "page");
      assert.equal(await selectedList.innerText(), scenario.listName);
    }
    const body = await page.locator("body").innerText();
    assert(body.includes(scenario.listName));
    assert(body.includes(scenario.viewName));
    for (const row of scenario.rows) assert(body.includes(row[0]), `Missing record: ${row[0]}`);
    assert(!/customer\d+@|contact\d+@/.test(body));
    assert.deepEqual(errors, []);
    await page.locator("body").evaluate(element => element.ownerDocument.fonts.ready);
    await page.waitForTimeout(250);

    // 3. 기존 이미지와 동일한 해상도로 촬영한다.
    const file = `${scene}-${locale}${mobile ? "-mobile" : ""}.jpg`;
    await page.screenshot({ path: path.join(stagingDirectory, file), type: "jpeg", quality: 90, animations: "disabled" });
    process.stdout.write(`captured ${file}\n`);
    return { file, locale, scene, viewport, recordCount: scenario.rows.length,
      routePath, sourceType: "LIST", viewType: "KANBAN", listName: scenario.listName,
      sidebarSelectionVerified: !mobile, headerAndDataSourceVerified: true };
  } finally {
    await context.close();
  }
}

const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  process.stdout.write(`staging ${stagingDirectory}\n`);
  const captures = [];
  for (const locale of ["ko", "en"]) {
    for (const scene of Object.keys(fixtures[locale])) {
      for (const mobile of [false, true]) {
        captures.push(await captureScene(browser, locale, scene, mobile));
      }
    }
  }
  assert.equal(captures.length, 20);
  // 모든 화면이 성공한 뒤 기존 에셋을 교체해 부분 실패 시 원본을 보존한다.
  await mkdir(outputDirectory, { recursive: true });
  for (const capture of captures) {
    await copyFile(path.join(stagingDirectory, capture.file), path.join(outputDirectory, capture.file));
  }
  const manifestPath = path.join(outputDirectory, "capture-manifest.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  await writeFile(manifestPath, JSON.stringify({
    ...manifest,
    capturedAt: new Date().toISOString().slice(0, 10),
    source: "Current User Web /app/workspaces/:workspaceId/lists/:listDefinitionId route rendered in Chromium",
    interface: "Unmodified work-list navigation, selected list header and native kanban cards",
    data: fixtures.description,
    fixtureSource: "scripts/fixtures/public-product-scenarios.json",
    captureScript: "scripts/capture-public-product.mjs",
    captureMode: "Existing E2E API mocks only; no database reads or writes; unchanged application UI",
    captures,
  }, null, 2) + "\n");
  process.stdout.write(`Updated ${captures.length} product screenshots.\n`);
} finally {
  await browser.close();
}

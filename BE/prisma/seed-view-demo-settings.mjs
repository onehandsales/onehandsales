import { createHash } from "node:crypto";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseEnv } from "node:util";
import { Prisma, PrismaClient } from "@prisma/client";

const seedDir = dirname(fileURLToPath(import.meta.url));
const repoDir = resolve(seedDir, "../..");
const fixture = JSON.parse(readFileSync(resolve(seedDir, "view-demo-settings.fixture.json"), "utf8"));
const mode = process.argv[2] || "plan";
const envPaths = ["BE/.env", "FE/user-web/.env", "FE/admin-web/.env"];
const backupDir = resolve(repoDir, "TEMP/view-demo-settings-20261028");
const protectedModels = [
  "Workspace", "WorkspaceMember", "Actor", "ObjectDefinition", "AttributeDefinition",
  "RecordDefinition", "RecordAttributeValueDefinition", "ListDefinition",
  "ListEntryDefinition", "ListEntryValueDefinition", "SelectOption", "StatusOption",
  "RelationshipDefinition", "ViewDefinition", "ViewAttributeSettingDefinition",
  "ViewFilterGroupDefinition", "ViewFilterConditionDefinition", "ViewSortDefinition",
  "ViewGroupDefinition", "ViewGroupSettingDefinition", "ViewWidgetDefinition",
  "ViewWorkDependencyDefinition", "ViewFavoriteDefinition",
];

// 기능 : JSON 객체 키 순서와 Prisma의 Date/Decimal 표현을 정규화합니다.
function canonical(value) {
  const plain = JSON.parse(JSON.stringify(value));
  function sort(item) {
    if (Array.isArray(item)) return item.map(sort);
    if (item && typeof item === "object") {
      return Object.fromEntries(Object.keys(item).sort().map((key) => [key, sort(item[key])]));
    }
    return item;
  }
  return JSON.stringify(sort(plain));
}

// 기능 : 검증 오류에 업무 값이나 접속 정보를 포함하지 않습니다.
function check(condition, code) {
  if (!condition) throw new Error("VIEW_DEMO_" + code);
}

// 기능 : 예상 필드만 비교하고 생성 시각 등 자동 필드는 별도로 보존합니다.
function matches(actual, expected) {
  return actual && Object.entries(expected).every(([key, value]) =>
    canonical(actual[key]) === canonical(value));
}

// 기능 : fixture의 Workspace UUID와 이름으로 재실행에 동일한 UUID를 생성합니다.
function seedId(key) {
  const namespace = Buffer.from(fixture.workspaceId.replaceAll("-", ""), "hex");
  const bytes = createHash("sha1").update(namespace).update("view-demo-settings/" + key).digest().subarray(0, 16);
  bytes[6] = (bytes[6] & 15) | 80;
  bytes[8] = (bytes[8] & 63) | 128;
  const hex = bytes.toString("hex");
  return [hex.slice(0, 8), hex.slice(8, 12), hex.slice(12, 16), hex.slice(16, 20), hex.slice(20)].join("-");
}

// 기능 : ENV 내용을 출력하지 않고 변경 여부만 확인할 digest를 만듭니다.
function envDigests() {
  return Object.fromEntries(envPaths.map((path) => [
    path, createHash("sha256").update(readFileSync(resolve(repoDir, path))).digest("hex"),
  ]));
}

// 기능 : 모델 이름을 Prisma delegate 이름으로 변환합니다.
function delegate(model) {
  return model[0].toLowerCase() + model.slice(1);
}

// 기능 : 작업 대상 24개 View와 연결 설정을 읽고 Workspace 경계를 검증합니다.
async function loadState(tx) {
  const workspace = await tx.workspace.findUnique({ where: { id: fixture.workspaceId } });
  check(workspace?.name === fixture.workspaceName, "WORKSPACE_MISMATCH");
  const ids = fixture.views.map((view) => view.id);
  const views = await tx.viewDefinition.findMany({ where: { id: { in: ids } } });
  check(views.length === fixture.expected.views, "VIEW_COUNT");
  for (const expected of fixture.views) {
    const actual = views.find((view) => view.id === expected.id);
    check(matches(actual, { ...expected, workspaceId: fixture.workspaceId }), "VIEW_IDENTITY");
  }
  const result = { ViewDefinition: views };
  for (const model of ["ViewAttributeSettingDefinition", "ViewSortDefinition",
    "ViewFilterGroupDefinition", "ViewFilterConditionDefinition", "ViewWidgetDefinition"]) {
    result[model] = await tx[delegate(model)].findMany({
      where: { viewDefinitionId: { in: ids } },
    });
    check(result[model].every((row) => row.workspaceId === fixture.workspaceId), "SETTING_WORKSPACE");
  }
  check(result.ViewAttributeSettingDefinition.length === fixture.expected.attributeSettings, "ATTRIBUTE_SETTINGS_COUNT");
  const actorIds = [...new Set(views.map((view) => view.createdByActorId))];
  const actors = await tx.actor.findMany({ where: { id: { in: actorIds }, workspaceId: fixture.workspaceId } });
  check(actors.length === actorIds.length, "ACTOR_SCOPE");
  const attributes = await tx.attributeDefinition.findMany({ where: { workspaceId: fixture.workspaceId } });
  result.attributes = new Map(attributes.map((attribute) => [attribute.id, attribute]));
  const objects = await tx.objectDefinition.findMany({ where: { workspaceId: fixture.workspaceId }, select: { id: true } });
  const lists = await tx.listDefinition.findMany({ where: { workspaceId: fixture.workspaceId }, select: { id: true } });
  for (const view of views) {
    check(!view.objectDefinitionId || objects.some((object) => object.id === view.objectDefinitionId), "OBJECT_SCOPE");
    check(!view.listDefinitionId || lists.some((list) => list.id === view.listDefinitionId), "LIST_SCOPE");
  }
  result.entries = await tx.listEntryDefinition.findMany({
    where: { workspaceId: fixture.workspaceId },
    select: { listDefinitionId: true, recordDefinition: { select: { objectDefinitionId: true, workspaceId: true } } },
  });
  return result;
}

// 기능 : 기존 직접 참조 속성이 해당 View의 Record/ListEntry 소속인지 검증합니다.
function validateAttribute(state, setting) {
  const view = state.ViewDefinition.find((item) => item.id === setting.viewDefinitionId);
  const attribute = state.attributes.get(setting.attributeDefinitionId);
  check(view && attribute, "ATTRIBUTE_MISSING");
  check(!setting.referenceAttributeIdPathJson?.length, "UNEXPECTED_REFERENCE_PATH");
  if (setting.sourceScope === "LIST_ENTRY") {
    check(view.listDefinitionId && attribute.listDefinitionId === view.listDefinitionId, "LIST_ATTRIBUTE_SCOPE");
  } else {
    check(setting.sourceScope === "RECORD" && attribute.objectDefinitionId, "RECORD_ATTRIBUTE_SCOPE");
    if (view.objectDefinitionId) check(attribute.objectDefinitionId === view.objectDefinitionId, "OBJECT_ATTRIBUTE_SCOPE");
    else {
      const entries = state.entries.filter((entry) => entry.listDefinitionId === view.listDefinitionId);
      check(entries.length > 0 && entries.every((entry) =>
        entry.recordDefinition.objectDefinitionId === attribute.objectDefinitionId &&
        entry.recordDefinition.workspaceId === fixture.workspaceId), "LIST_RECORD_ATTRIBUTE_SCOPE");
    }
  }
}

// 기능 : 기존 JSON은 null 또는 동일 값일 때만 처리하고 다른 설정은 덮어쓰지 않습니다.
function buildPlan(state) {
  const patches = [], creations = [];
  const viewById = new Map(state.ViewDefinition.map((view) => [view.id, view]));
  function patch(model, row, field, value) {
    const view = model === "ViewDefinition" ? row : viewById.get(row.viewDefinitionId);
    check(view && (row[field] === null || canonical(row[field]) === canonical(value)), "EXISTING_JSON_CONFLICT");
    patches.push({ model, row, field, value, actorId: view.createdByActorId, pending: row[field] === null });
  }
  function create(model, input) {
    const view = viewById.get(input.viewDefinitionId);
    const data = { ...input, workspaceId: fixture.workspaceId,
      createdByActorId: view.createdByActorId, updatedByActorId: view.createdByActorId };
    const existing = state[model].find((row) => row.id === data.id);
    check(!existing || matches(existing, data), "EXISTING_FIXTURE_CONFLICT");
    creations.push({ model, data, pending: !existing });
  }

  // 1. View 타입별 설정과 현재 표시 속성 113개의 소속을 확인한다.
  for (const view of state.ViewDefinition) patch("ViewDefinition", view, "configJson", fixture.configs[view.type]);
  let formatCount = 0;
  for (const setting of state.ViewAttributeSettingDefinition) {
    validateAttribute(state, setting);
    const attribute = state.attributes.get(setting.attributeDefinitionId);
    const format = setting.attributeDefinitionId === fixture.progressAttributeId
      ? fixture.formats.progress : fixture.formats[attribute.type];
    if (format) {
      patch("ViewAttributeSettingDefinition", setting, "formatJson", format);
      formatCount++;
    }
  }
  check(formatCount === fixture.expected.formats, "FORMAT_COUNT");

  // 2. 기존 정렬은 보존하고 새 정렬은 고정 UUID로 중복을 방지한다.
  for (const expected of fixture.existingSorts) {
    const row = state.ViewSortDefinition.find((sort) => sort.id === expected.id);
    check(matches(row, expected), "EXISTING_SORT_CHANGED");
    validateAttribute(state, row);
    patch("ViewSortDefinition", row, "configJson", fixture.sortConfig);
  }
  for (const sort of fixture.newSorts) {
    validateAttribute(state, sort);
    create("ViewSortDefinition", { ...sort, id: seedId("sort/" + sort.viewDefinitionId), configJson: fixture.sortConfig });
  }
  const allowedSortIds = new Set([...fixture.existingSorts.map((row) => row.id),
    ...creations.filter((item) => item.model === "ViewSortDefinition").map((item) => item.data.id)]);
  check(state.ViewSortDefinition.every((row) => allowedSortIds.has(row.id)), "UNEXPECTED_SORT");

  // 3. 네 View 각각에 독립된 루트 AND 그룹과 단일 gte 조건을 둔다.
  for (const filter of fixture.filters) {
    validateAttribute(state, filter);
    const groupId = seedId("filter-group/" + filter.viewDefinitionId);
    create("ViewFilterGroupDefinition", {
      id: groupId, viewDefinitionId: filter.viewDefinitionId,
      parentViewFilterGroupDefinitionId: null, conditionGroupOperator: "AND", sortOrder: 0,
    });
    create("ViewFilterConditionDefinition", {
      ...filter, id: seedId("filter-condition/" + filter.viewDefinitionId),
      viewFilterGroupDefinitionId: groupId, referenceAttributeIdPathJson: [],
      multiValueMatchMode: "ANY", sortOrder: 0,
    });
  }
  for (const model of ["ViewFilterGroupDefinition", "ViewFilterConditionDefinition"]) {
    const allowed = new Set(creations.filter((item) => item.model === model).map((item) => item.data.id));
    check(state[model].every((row) => allowed.has(row.id)), "UNEXPECTED_FILTER");
  }

  // 4. 위젯의 기존 참조/배치는 유지하고 마지막 사용자 지시대로 제목 표시만 설정한다.
  check(state.ViewWidgetDefinition.length === fixture.expected.widgets, "WIDGET_COUNT");
  for (const expected of fixture.widgets) {
    const { configJson, ...identity } = expected;
    const row = state.ViewWidgetDefinition.find((widget) => widget.id === expected.id);
    check(matches(row, identity), "WIDGET_CHANGED");
    check(viewById.get(row.viewDefinitionId)?.type === "DASHBOARD" &&
      viewById.has(row.contentViewDefinitionId), "WIDGET_SCOPE");
    patch("ViewWidgetDefinition", row, "configJson", configJson);
  }
  check(patches.length === 61 && creations.length === 12, "PLAN_COUNT");
  check(!patches.some((item) => Object.hasOwn(item.value, "version")), "UNEXPECTED_VERSION");
  return { patches, creations };
}

// 기능 : 개인정보 원문을 내보내지 않고 변경 허용 행 외의 전체 CRM 데이터 digest를 계산합니다.
async function fingerprints(tx, plan = null) {
  const result = {};
  for (const model of protectedModels) {
    const ids = plan ? [
      ...plan.patches.filter((item) => item.model === model).map((item) => item.row.id),
      ...plan.creations.filter((item) => item.model === model).map((item) => item.data.id),
    ] : [];
    const table = Prisma.raw('"' + model + '"');
    const where = ids.length ? Prisma.sql`WHERE NOT (t."id" = ANY(ARRAY[${Prisma.join(ids)}]::uuid[]))` : Prisma.empty;
    const query = Prisma.sql`SELECT count(*)::text AS count, md5(COALESCE(string_agg(to_jsonb(t)::text, '' ORDER BY t."id"), '')) AS digest FROM ${table} t ${where}`;
    const rows = await tx.$queryRaw(query);
    result[model] = rows[0];
  }
  return result;
}

// 기능 : 입력 전 원본 설정과 신규 ID를 Git 제외 로컬 경로에 보관합니다.
function backup(plan, untouched, allBefore, environment) {
  mkdirSync(backupDir, { recursive: true });
  const name = "before-" + new Date().toISOString().replaceAll(":", "-") + ".json";
  const path = resolve(backupDir, name);
  writeFileSync(path, JSON.stringify({
    capturedAt: new Date().toISOString(), workspaceId: fixture.workspaceId,
    before: plan.patches.map(({ model, row, field, value }) => ({ model, row, field, intendedValue: value })),
    insertedRows: plan.creations.filter((item) => item.pending).map(({ model, data }) => ({ model, data })),
    untouched, allBefore, environment,
  }, null, 2) + "\n", { flag: "wx" });
  return path;
}

// 기능 : 원본 제목·배치·생성 정보 등 허용하지 않은 필드가 바뀌지 않았는지 검증합니다.
async function verifyTargets(tx, plan) {
  for (const item of plan.patches) {
    const row = await tx[delegate(item.model)].findUnique({ where: { id: item.row.id } });
    check(row && canonical(row[item.field]) === canonical(item.value), "PATCH_NOT_SAVED");
    const preserved = Object.fromEntries(Object.entries(item.row).filter(([key]) =>
      ![item.field, "updatedAt", "updatedByActorId"].includes(key)));
    check(matches(row, preserved), "UNEXPECTED_FIELD_CHANGE");
    if (item.pending) check(row.updatedByActorId === item.actorId, "UPDATE_ACTOR");
  }
  for (const item of plan.creations) {
    const row = await tx[delegate(item.model)].findUnique({ where: { id: item.data.id } });
    check(matches(row, item.data), "CREATION_NOT_SAVED");
  }
}

// 기능 : 저장된 필터값을 실제 값 테이블에 대입하여 fixture의 예상 건수와 합계를 확인합니다.
async function verifyResults(tx) {
  const result = {};
  for (const item of fixture.filters) {
    const filter = await tx.viewFilterConditionDefinition.findUnique({
      where: { id: seedId("filter-condition/" + item.viewDefinitionId) },
    });
    const view = fixture.views.find((candidate) => candidate.id === item.viewDefinitionId);
    check(filter?.comparisonOperator === "gte", "FILTER_OPERATOR");
    if (item.sourceScope === "RECORD") {
      const rows = await tx.$queryRaw(Prisma.sql`
SELECT count(*)::text AS count, count(DISTINCT e."id")::text AS "distinctCount",
       COALESCE(sum(v."numberValue"), 0)::text AS amount
FROM "ListEntryDefinition" e JOIN "RecordAttributeValueDefinition" v
ON v."recordDefinitionId" = e."recordDefinitionId" AND v."workspaceId" = e."workspaceId"
WHERE e."workspaceId" = ${fixture.workspaceId}::uuid
AND e."listDefinitionId" = ${view.listDefinitionId}::uuid
AND v."attributeDefinitionId" = ${filter.attributeDefinitionId}::uuid
AND v."numberValue" >= ${filter.comparisonValueJson.value}::numeric
`);
      const row = rows[0];
      check(Number(row.count) === fixture.expected.filteredPipelineEntries &&
        row.count === row.distinctCount &&
        new Prisma.Decimal(row.amount).eq(fixture.expected.filteredPipelineAmount), "PIPELINE_RESULT");
      result[view.type] = { entries: Number(row.count), amount: new Prisma.Decimal(row.amount).toString(), currency: "USD" };
    } else {
      const rows = await tx.$queryRaw(Prisma.sql`
SELECT count(DISTINCT e."id")::text AS count FROM "ListEntryDefinition" e
JOIN "ListEntryValueDefinition" v ON v."listEntryDefinitionId" = e."id"
AND v."workspaceId" = e."workspaceId" AND v."listDefinitionId" = e."listDefinitionId"
WHERE e."workspaceId" = ${fixture.workspaceId}::uuid
AND e."listDefinitionId" = ${view.listDefinitionId}::uuid
AND v."attributeDefinitionId" = ${filter.attributeDefinitionId}::uuid
AND v."dateValue" >= ${filter.comparisonValueJson.value}::date
`);
      check(Number(rows[0].count) === fixture.expected.filteredTimelineEntries, "TIMELINE_RESULT");
      result[view.type] = { entries: Number(rows[0].count) };
    }
  }
  return result;
}

// 기능 : 단일 transaction으로 설정을 적용하며 rollback 모드에서는 마지막에 전부 되돌립니다.
async function run(db, environment) {
  let summary, baseline;
  const rollbackMarker = new Error("VIEW_DEMO_ROLLBACK_SUCCESS");
  try {
    summary = await db.$transaction(async (tx) => {
      const readOnly = ["plan", "verify"].includes(mode);
      if (readOnly) await tx.$executeRawUnsafe("SET TRANSACTION READ ONLY");
      else {
        // 1. 동일 fixture 실행을 직렬화하고 수정하는 기존 행을 잠근다.
        await tx.$queryRaw(Prisma.sql`SELECT pg_advisory_xact_lock(hashtextextended(${fixture.workspaceId + "/view-demo-settings"}, 0))::text AS locked`);
        for (const model of ["ViewDefinition", "ViewAttributeSettingDefinition", "ViewSortDefinition",
          "ViewFilterGroupDefinition", "ViewFilterConditionDefinition", "ViewWidgetDefinition"]) {
          await tx.$queryRaw(Prisma.sql`SELECT "id" FROM ${Prisma.raw('"' + model + '"')} WHERE "workspaceId" = ${fixture.workspaceId}::uuid ORDER BY "id" FOR UPDATE`);
        }
      }
      const state = await loadState(tx);
      const plan = buildPlan(state);
      const pendingUpdates = plan.patches.filter((item) => item.pending);
      const pendingInserts = plan.creations.filter((item) => item.pending);
      const untouched = await fingerprints(tx, plan);
      const info = { mode, workspaceId: fixture.workspaceId,
        pendingUpdates: pendingUpdates.length, pendingInserts: pendingInserts.length };
      if (mode === "plan") return info;
      if (mode === "verify") {
        check(!pendingUpdates.length && !pendingInserts.length, "NOT_APPLIED");
        await verifyTargets(tx, plan);
        return { ...info, results: await verifyResults(tx), untouched };
      }
      baseline = await fingerprints(tx);
      if (mode === "apply" && (pendingUpdates.length || pendingInserts.length)) {
        info.backup = backup(plan, untouched, baseline, environment);
      }

      // 2. 기존 JSON만 갱신하고 정렬→그룹→조건 순서로 생성한다.
      for (const item of pendingUpdates) {
        await tx[delegate(item.model)].update({
          where: { id: item.row.id },
          data: { [item.field]: item.value, updatedByActorId: item.actorId },
        });
      }
      for (const model of ["ViewSortDefinition", "ViewFilterGroupDefinition", "ViewFilterConditionDefinition"]) {
        for (const item of pendingInserts.filter((entry) => entry.model === model)) {
          await tx[delegate(model)].create({ data: item.data });
        }
      }

      // 3. 저장 필드, 실제 조회 결과, 허용 범위 밖 전체 데이터 보존을 검증한다.
      await verifyTargets(tx, plan);
      const rebuilt = buildPlan(await loadState(tx));
      check(!rebuilt.patches.some((item) => item.pending) &&
        !rebuilt.creations.some((item) => item.pending), "INCOMPLETE_APPLY");
      check(canonical(untouched) === canonical(await fingerprints(tx, plan)), "UNTOUCHED_CHANGED");
      check(canonical(environment) === canonical(envDigests()), "ENV_CHANGED");
      summary = { ...info, writtenRows: pendingUpdates.length + pendingInserts.length,
        results: await verifyResults(tx), untouchedPreserved: true, envPreserved: true };
      if (mode === "rollback") throw rollbackMarker;
      return summary;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: 60000, maxWait: 10000 });
  } catch (error) {
    if (error !== rollbackMarker) throw error;
    const after = await db.$transaction(async (tx) => {
      await tx.$executeRawUnsafe("SET TRANSACTION READ ONLY");
      return fingerprints(tx);
    }, { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead, timeout: 60000 });
    check(canonical(after) === canonical(baseline), "ROLLBACK_NOT_RESTORED");
    summary = { ...summary, committedRows: 0, rollbackVerified: true };
  }
  return summary;
}

// 기능 : 기본 plan은 읽기 전용이며 명시한 mode만 실행하고 접속 정보를 출력하지 않습니다.
async function main() {
  check(["plan", "rollback", "apply", "verify"].includes(mode), "INVALID_MODE");
  const environment = envDigests();
  const env = parseEnv(readFileSync(resolve(repoDir, "BE/.env"), "utf8"));
  check(Boolean(env.DATABASE_URL), "DATABASE_URL_MISSING");
  const db = new PrismaClient({ datasources: { db: { url: env.DATABASE_URL } }, log: [] });
  try {
    const result = await run(db, environment);
    check(canonical(environment) === canonical(envDigests()), "ENV_CHANGED");
    process.stdout.write(JSON.stringify(result, null, 2) + "\n");
  } finally {
    await db.$disconnect();
  }
}

main().catch((error) => {
  const safeMessage = typeof error.message === "string" && error.message.startsWith("VIEW_DEMO_")
    ? error.message : "VIEW_DEMO_FAILED";
  process.stderr.write(JSON.stringify({ error: safeMessage, code: error.code || null }) + "\n");
  process.exitCode = 1;
});

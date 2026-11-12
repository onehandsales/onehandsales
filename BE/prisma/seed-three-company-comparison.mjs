import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseEnv } from "node:util";
import { Prisma, PrismaClient } from "@prisma/client";
import { buildComparisonFixture, comparisonId } from "./three-company-comparison.fixture.mjs";

// 역할 : 현재 계정의 Workspace에 비교용 CRM 데이터를 넣는 독립 유지보수 도구입니다.
// 실행 : BE에서 node prisma/seed-three-company-comparison.mjs <mode> <workspace UUID> <user UUID>
// mode : plan=조회만, rollback=삽입 검증 후 전체 롤백, apply=누락 행 추가, verify=초기 fixture와 비교.
// 이후 화면/API에서 fixture 값을 수정하면 plan/apply/verify는 차이를 감지하여 중단합니다.
// 복원·삭제·사용자 변경 덮어쓰기 기능은 없으며, 기본 prisma:seed와 별도로 실행합니다.
// 구성 : 회사 TABLE 3건 / 영업 LIST 9건 / 영업 파이프라인 KANBAN 참여 6건.
// 범위 : Object 2, List 1, Attribute 22, Record 12, ListEntry 6, View 3과 연결 설정.
// 검증 : FK·값 소속·양방향 참조·View 경로·비교군 외 행 보존·ENV 파일 보존.

const backendDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const [mode = "plan", workspaceId, userId] = process.argv.slice(2);
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const models = Prisma.dmmf.datamodel.models;
const rollbackMarker = new Error("COMPARISON_REHEARSAL_ROLLBACK");

// 기능 : 오류에 접속 문자열·토큰·사용자 입력 원문을 노출하지 않습니다.
function check(condition, code) {
  if (!condition) throw new Error(`COMPARISON_${code}`);
}

// 기능 : Date/Decimal/JSON을 동일 표현으로 바꾸어 저장 값과 계획을 비교합니다.
function canonical(value) {
  const plain = JSON.parse(JSON.stringify(value));
  const sorted = (item) => Array.isArray(item) ? item.map(sorted)
    : item && typeof item === "object"
      ? Object.fromEntries(Object.keys(item).sort().map(key => [key, sorted(item[key])])) : item;
  return JSON.stringify(sorted(plain));
}

// 기능 : 모델명과 스키마에서 읽은 식별자만 SQL/Prisma 접근에 사용합니다.
const delegate = (model) => model[0].toLowerCase() + model.slice(1);
const quote = (name) => '"' + name.replaceAll('"', '""') + '"';

// 기능 : 기존 ENV는 읽기만 하며 값 대신 파일 digest를 검증합니다.
function readConfiguration() {
  const env = {}, digests = {};
  for (const name of [".env", ".env.local"]) {
    const path = resolve(backendDir, name);
    if (!existsSync(path)) continue;
    const content = readFileSync(path, "utf8");
    Object.assign(env, parseEnv(content));
    digests[name] = createHash("sha256").update(content).digest("hex");
  }
  const databaseUrl = env.DIRECT_URL || env.DATABASE_URL;
  check(databaseUrl, "DATABASE_CONFIGURATION_MISSING");
  const url = new URL(databaseUrl);
  check(/(^|\.)supabase\.(co|com)$/.test(url.hostname), "EXPECTED_SUPABASE");
  url.searchParams.set("connection_limit", "1");
  url.searchParams.set("connect_timeout", "10");
  return { url: url.toString(), digests };
}

// 기능 : 원래 계정/멤버십/Actor를 검증하고 기존 sidebar 순서 뒤에 비교군을 배치합니다.
async function fixtureFor(tx, writing = false) {
  const user = await tx.user.findUnique({ where: { id: userId }, select: { status: true } });
  const member = await tx.workspaceMember.findUnique({ where: { workspaceId_userId: { workspaceId, userId } } });
  check(user?.status === "ACTIVE" && member && ["OWNER", "ADMIN"].includes(member.role), "ACTIVE_OWNER_OR_ADMIN_REQUIRED");
  if (writing) {
    const key = `onehandsales:view-favorite:${workspaceId}:${member.id}`;
    await tx.$queryRaw`SELECT 1 AS locked FROM pg_advisory_xact_lock(hashtextextended(${key}, 0))`;
  }
  const actors = await tx.actor.findMany({ where: { workspaceId, workspaceMemberId: member.id, type: "WORKSPACE_MEMBER" }, select: { id: true } });
  check(actors.length === 1, "EXISTING_MEMBER_ACTOR_REQUIRED");
  // 기능 : 이미 생성한 비교군은 원래 위치를 사용하고 새 비교군만 마지막 순서에 추가합니다.
  const order = async (model, key, scope) => {
    const first = await tx[delegate(model)].findUnique({ where: { id: comparisonId(workspaceId, key) }, select: { sortOrder: true } });
    if (first) return first.sortOrder;
    const aggregate = await tx[delegate(model)].aggregate({ where: scope, _max: { sortOrder: true } });
    return (aggregate._max.sortOrder ?? -1) + 1;
  };
  return buildComparisonFixture({ workspaceId, actorId: actors[0].id, memberId: member.id,
    objectOrder: await order("ObjectDefinition", "object/companies", { workspaceId }),
    listOrder: await order("ListDefinition", "list/pipeline", { workspaceId }),
    favoriteOrder: await order("ViewFavoriteDefinition", `favorite/${comparisonId(workspaceId, "view/company-table")}`, { workspaceId, workspaceMemberId: member.id }),
  });
}

// 기능 : FK만으로 보장되지 않는 값 소속과 양방향 관계, View 참조 경로를 검증합니다.
function validateFixture(fixture) {
  const { rows, ids } = fixture;
  const all = Object.values(rows).flat();
  check(new Set(all.map(row => row.id)).size === all.length, "DUPLICATE_ID");
  check(all.every(row => row.workspaceId === workspaceId), "WORKSPACE_SCOPE");
  const attributes = new Map(rows.AttributeDefinition.map(row => [row.id, row]));
  const records = new Map(rows.RecordDefinition.map(row => [row.id, row]));
  const entries = new Map(rows.ListEntryDefinition.map(row => [row.id, row]));
  const values = [...rows.RecordAttributeValueDefinition, ...rows.ListEntryValueDefinition];
  for (const row of values) {
    const attribute = attributes.get(row.attributeDefinitionId);
    check(attribute?.type === row.attributeType, "VALUE_TYPE");
    if (row.recordDefinitionId) {
      check(attribute.objectDefinitionId === records.get(row.recordDefinitionId)?.objectDefinitionId
        && row.objectDefinitionId === attribute.objectDefinitionId, "RECORD_VALUE_OWNER");
    } else {
      check(attribute.listDefinitionId === entries.get(row.listEntryDefinitionId)?.listDefinitionId
        && row.listDefinitionId === attribute.listDefinitionId, "ENTRY_VALUE_OWNER");
    }
    if (row.targetRecordDefinitionId) check(records.get(row.targetRecordDefinitionId)?.objectDefinitionId === row.targetObjectDefinitionId, "REFERENCE_TARGET");
    for (const [field, model] of [["selectOptionId", "SelectOption"], ["statusOptionId", "StatusOption"]]) {
      if (row[field]) check(rows[model].some(option => option.id === row[field] && option.attributeDefinitionId === row.attributeDefinitionId), "OPTION_OWNER");
    }
  }
  const references = values.filter(row => row.targetRecordDefinitionId);
  check(references.length === 18 && references.every(row => references.some(reverse =>
    reverse.recordDefinitionId === row.targetRecordDefinitionId && reverse.targetRecordDefinitionId === row.recordDefinitionId)), "PAIRED_COMPANY_REFERENCES");
  check(records.size === 12 && entries.size === 6 && new Set([...entries.values()].map(row => row.recordDefinitionId)).size === 6, "SOURCE_COUNTS");
  for (const view of rows.ViewDefinition) {
    check(Boolean(view.objectDefinitionId) !== Boolean(view.listDefinitionId), "VIEW_SOURCE");
    const bindings = rows.ViewAttributeSettingDefinition.filter(row => row.viewDefinitionId === view.id);
    check(bindings.filter(row => row.attributeDisplayRole === "TITLE").length === 1, "SINGLE_TITLE");
    for (const binding of bindings) {
      const attribute = attributes.get(binding.attributeDefinitionId);
      if (binding.sourceScope === "LIST_ENTRY") check(attribute.listDefinitionId === view.listDefinitionId && view.listDefinitionId, "LIST_BINDING_OWNER");
      else {
        let objectId = view.objectDefinitionId ?? ids.salesObject;
        for (const referenceId of binding.referenceAttributeIdPathJson) {
          const reference = attributes.get(referenceId);
          check(reference?.objectDefinitionId === objectId && reference.type === "RecordReference", "REFERENCE_PATH");
          objectId = reference.configJson.recordReference.objectDefinitionId;
        }
        check(attribute.objectDefinitionId === objectId, "RECORD_BINDING_OWNER");
      }
    }
  }
}

// 기능 : 동일 ID는 동일 내용일 때만 재사용하고 slug 충돌이나 사용자 수정을 덮어쓰지 않습니다.
async function makePlan(tx, fixture) {
  const plan = {};
  for (const [model, expectedRows] of Object.entries(fixture.rows)) {
    const existing = await tx[delegate(model)].findMany({ where: { id: { in: expectedRows.map(row => row.id) } } });
    const byId = new Map(existing.map(row => [row.id, row]));
    for (const row of expectedRows) {
      const actual = byId.get(row.id);
      if (actual) {
        const field = Object.keys(row).find(key => canonical(actual[key]) !== canonical(row[key]));
        check(!field, `EXISTING_ROW_CHANGED_${model}_${field ?? ""}`);
      }
    }
    plan[model] = expectedRows.filter(row => !byId.has(row.id));
  }
  for (const model of ["ObjectDefinition", "ListDefinition"]) {
    const expected = fixture.rows[model];
    const colliding = await tx[delegate(model)].count({ where: {
      workspaceId, apiSlug: { in: expected.map(row => row.apiSlug) }, id: { notIn: expected.map(row => row.id) },
    } });
    check(colliding === 0, `SLUG_COLLISION_${model}`);
  }
  return plan;
}

// 기능 : 비교군 이외의 모든 public 모델 행과 migration 이력은 내용 hash로 보존 확인합니다.
async function protectedSnapshot(tx, fixture) {
  const snapshot = {};
  for (const model of models) {
    const excluded = (fixture.rows[model.name] ?? []).map(row => row.id);
    const table = quote(model.dbName ?? model.name);
    const [result] = await tx.$queryRawUnsafe(
      `SELECT count(*)::int AS count, md5(COALESCE(string_agg(md5(to_jsonb(t)::text), '' ORDER BY t.id), '')) AS digest FROM public.${table} t WHERE NOT (t.id = ANY($1::uuid[]))`, excluded);
    snapshot[model.name] = result;
  }
  [snapshot._prisma_migrations] = await tx.$queryRawUnsafe(
    'SELECT count(*)::int AS count, md5(COALESCE(string_agg(md5(to_jsonb(t)::text), \'\' ORDER BY t.id), \'\')) AS digest FROM public."_prisma_migrations" t');
  return snapshot;
}

// 기능 : nullable JSON은 SQL NULL로 저장하고 FK 의존 순서대로 누락 행만 추가합니다.
async function insertPlan(tx, plan) {
  for (const [model, rows] of Object.entries(plan)) {
    if (!rows.length) continue;
    const jsonFields = models.find(item => item.name === model).fields.filter(field => field.type === "Json").map(field => field.name);
    const data = rows.map(row => Object.fromEntries(Object.entries(row).map(([key, value]) =>
      [key, value === null && jsonFields.includes(key) ? Prisma.DbNull : value])));
    const result = await tx[delegate(model)].createMany({ data });
    check(result.count === rows.length, `INSERT_COUNT_${model}`);
  }
  // 1. deferred FK도 COMMIT 이전의 검증 범위에 포함한다.
  await tx.$executeRawUnsafe("SET CONSTRAINTS ALL IMMEDIATE");
}

// 기능 : 로컬 검증 또는 단일 DB transaction의 계획·리허설·반영·검증을 실행합니다.
async function main() {
  check(["plan", "rollback", "apply", "verify"].includes(mode) && uuid.test(workspaceId ?? "") && uuid.test(userId ?? ""), "USAGE_MODE_WORKSPACE_UUID_USER_UUID");
  const config = readConfiguration();
  const prisma = new PrismaClient({ datasources: { db: { url: config.url } }, log: [] });
  let report;
  try {
    await prisma.$transaction(async tx => {
      const writing = ["apply", "rollback"].includes(mode);
      if (!writing) await tx.$executeRawUnsafe("SET TRANSACTION READ ONLY");
      else {
        // 1. 앱의 Object/List sidebar 정렬과 같은 범위의 잠금을 사용한다.
        for (const key of [`onehandsales:sidebar:objects:${workspaceId}`, `onehandsales:sidebar:lists:${workspaceId}`]) {
          await tx.$queryRaw`SELECT 1 AS locked FROM pg_advisory_xact_lock(hashtextextended(${key}, 0))`;
        }
      }
      const fixture = await fixtureFor(tx, writing);
      validateFixture(fixture);
      const plan = await makePlan(tx, fixture);
      report = { mode, workspaceId, counts: Object.fromEntries(Object.entries(fixture.rows).map(([model, rows]) => [model, rows.length])),
        missing: Object.fromEntries(Object.entries(plan).map(([model, rows]) => [model, rows.length])), views: fixture.ids };
      if (mode === "verify") check(Object.values(plan).every(rows => rows.length === 0), "MISSING_SEED_ROWS");
      if (writing) {
        // 2. 비교군 외 행의 내용과 migration 이력을 보존한 채 계획을 원자적으로 추가한다.
        const before = await protectedSnapshot(tx, fixture);
        await insertPlan(tx, plan);
        const remaining = await makePlan(tx, fixture);
        check(Object.values(remaining).every(rows => rows.length === 0), "POST_INSERT_MISSING_ROWS");
        check(canonical(before) === canonical(await protectedSnapshot(tx, fixture)), "PROTECTED_DATA_CHANGED");
        report.protectedDataUnchanged = true;
        report.migrationRowsUnchanged = before._prisma_migrations.count;
      }
      check(canonical(config.digests) === canonical(readConfiguration().digests), "ENV_CHANGED");
      if (mode === "rollback") throw rollbackMarker;
    }, { isolationLevel: "Serializable", maxWait: 10000, timeout: 120000 });
    console.log(JSON.stringify({ ...report, result: mode === "apply" ? "COMMITTED" : "OK" }, null, 2));
  } catch (error) {
    if (error === rollbackMarker) console.log(JSON.stringify({ ...report, result: "ROLLED_BACK" }, null, 2));
    else throw error;
  } finally {
    await prisma.$disconnect();
  }
}

await main().catch(error => {
  console.error(JSON.stringify({ result: "FAILED", code: error.message?.startsWith("COMPARISON_") ? error.message : error.code ?? error.name }));
  process.exitCode = 1;
});

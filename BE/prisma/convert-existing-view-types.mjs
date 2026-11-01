import { createHash, randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseEnv } from "node:util";
import { Prisma, PrismaClient } from "@prisma/client";

const directory = dirname(fileURLToPath(import.meta.url));
const backend = resolve(directory, "..");
const repository = resolve(backend, "..");
const require = createRequire(import.meta.url);
require("ts-node").register({ project: resolve(backend, "tsconfig.json"), transpileOnly: true });
const paths = require("tsconfig-paths");
const configuration = paths.loadConfig(backend);
paths.register({ baseUrl: configuration.absoluteBaseUrl, paths: configuration.paths });
// 기능 : 설치된 Backend의 실제 조회 구현을 검증에 재사용합니다.
const source = (file) => require(resolve(backend, "src", file));
const { PrismaReadSnapshotRunner, PrismaTransactionManager, resolvePrismaReadContext } = source("shared/infrastructure/prisma/prisma-transaction-manager.ts");
const { PrismaViewDataConfigurationQueryRepository } = source("modules/view-definition/infrastructure/persistence/prisma-view-data-configuration-query.repository.ts");
const { PrismaViewHeaderConfigurationQueryRepository } = source("modules/view-definition/infrastructure/persistence/prisma-view-header-configuration-query.repository.ts");
const { PrismaRecordDataQueryRepository } = source("modules/record-definition/infrastructure/persistence/prisma-record-data-query.repository.ts");
const { PrismaListEntryDataQueryRepository } = source("modules/list-definition/infrastructure/persistence/prisma-list-entry-data-query.repository.ts");
const { PrismaObjectDefinitionSummaryQueryRepository } = source("modules/object-definition/infrastructure/persistence/prisma-object-definition-summary-query.repository.ts");
const { PrismaAttributeDefinitionMetadataQueryRepository } = source("modules/attribute-definition/infrastructure/persistence/prisma-attribute-definition-metadata-query.repository.ts");
const { PrismaAttributeRelationshipQueryRepository } = source("modules/attribute-definition/infrastructure/persistence/prisma-attribute-relationship-query.repository.ts");
const { PrismaWorkspaceSnapshotQueryRepository } = source("modules/workspace/infrastructure/persistence/prisma-workspace-snapshot-query.repository.ts");
const { ViewDataLoader, resolveViewSource } = source("modules/view-definition/application/view-data/view-data-loader.ts");
const { ViewDataQueryContext } = source("modules/view-definition/application/view-data/view-data-query-context.ts");
const { readViewData } = source("modules/view-definition/application/view-data/view-data-readers.ts");
const { EncryptedViewDataTokenCodec } = source("modules/view-definition/infrastructure/view-data-token-codec.ts");

const fixture = JSON.parse(readFileSync(resolve(directory, "view-demo-settings.fixture.json"), "utf8"));
const modes = ["plan", "rehearse", "apply", "verify"];
const mode = process.argv[2] ?? "plan";
const changes = {
  TIMELINE: { type: "TABLE", name: "제품 평가 일정표" },
  GALLERY: { type: "LIST", name: "제품 목록" },
  CALENDAR: { type: "LIST", name: "영업 일정 목록" },
  MAP: { type: "TABLE", name: "타깃 계정·거점 목록" },
  GANTT: { type: "TABLE", name: "업무 진행표" },
  CHART: { type: "KANBAN", name: "단계별 영업기회" },
  PIVOT: { type: "TABLE", name: "회사·단계별 영업기회" },
  DASHBOARD: { type: "LIST", name: "영업 현황 목록" },
};
const changedModels = ["ViewDefinition", "ViewAttributeSettingDefinition", "ViewGroupDefinition", "ViewWidgetDefinition"];
const protectedModels = ["Workspace", "WorkspaceMember", "Actor", "ObjectDefinition", "AttributeDefinition", "RecordDefinition", "RecordAttributeValueDefinition", "ListDefinition", "ListEntryDefinition", "ListEntryValueDefinition", "SelectOption", "StatusOption", "RelationshipDefinition", "ViewFilterGroupDefinition", "ViewFilterConditionDefinition", "ViewSortDefinition", "ViewGroupSettingDefinition", "ViewWorkDependencyDefinition", "ViewFavoriteDefinition"];
const targetIds = fixture.views.filter(view => changes[view.type]).map(view => view.id);
const rollbackMarker = new Error("VIEW_TYPE_REHEARSAL_ROLLBACK");
let stage = "startup";

// 기능 : 접속 정보나 업무 값 없이 실패 원인 코드만 전달합니다.
function check(condition, code) { if (!condition) throw new Error("VIEW_TYPE_CONVERSION_" + code); }
// 기능 : Date와 JSON 키 순서를 정규화하여 보존 필드와 계획을 비교합니다.
function canonical(value) {
  const normalized = JSON.parse(JSON.stringify(value));
  // 기능 : 중첩 객체의 키 순서만 정규화하고 배열의 표시 순서는 보존합니다.
  function ordered(item) {
    if (Array.isArray(item)) return item.map(ordered);
    if (item && typeof item === "object") return Object.fromEntries(Object.keys(item).sort().map(key => [key, ordered(item[key])]));
    return item;
  }
  return JSON.stringify(ordered(normalized));
}
// 기능 : 고정된 Prisma 모델 이름을 delegate와 SQL 식별자로 변환합니다.
function delegate(model) { return model[0].toLowerCase() + model.slice(1); }
// 기능 : 복구 SQL의 값이 SQL 구문으로 해석되지 않게 문자열 리터럴을 만듭니다.
function literal(value) { return "'" + String(value).replaceAll("'", "''") + "'"; }
// 기능 : ENV 파일 내용을 출력하거나 변경하지 않고 메모리에서만 읽습니다.
function environment() {
  const files = ["BE/.env", "BE/.env.local", "FE/user-web/.env", "FE/user-web/.env.local", "FE/admin-web/.env", "FE/admin-web/.env.local"];
  const hashes = {}, values = {};
  for (const name of files) {
    const path = resolve(repository, name);
    if (!existsSync(path)) continue;
    const contents = readFileSync(path, "utf8");
    hashes[name] = createHash("sha256").update(contents).digest("hex");
    if (name.startsWith("BE/")) Object.assign(values, parseEnv(contents));
  }
  check(Boolean(values.DATABASE_URL), "DATABASE_URL_MISSING");
  return { hashes, values };
}
// 기능 : 허용한 모델의 전체 행을 정렬해 원문을 출력하지 않는 보존 digest를 조회합니다.
async function digests(tx, models, excluded = {}) {
  const result = {};
  for (const model of models) {
    const ids = excluded[model] ?? [];
    const where = ids.length ? Prisma.sql`WHERE t."id"::text NOT IN (${Prisma.join(ids)})` : Prisma.empty;
    const [row] = await tx.$queryRaw(Prisma.sql`SELECT count(*)::text AS count, md5(COALESCE(string_agg(to_jsonb(t)::text, '' ORDER BY t."id"), '')) AS digest FROM ${Prisma.raw('"' + model + '"')} t ${where}`);
    result[model] = row;
  }
  return result;
}
// 기능 : 승인한 영업 샘플의 24개 View 신원과 전환 전후 상태를 확인합니다.
async function state(tx) {
  const workspace = await tx.workspace.findUnique({ where: { id: fixture.workspaceId }, select: { name: true } });
  check(workspace?.name === fixture.workspaceName, "WORKSPACE_MISMATCH");
  const views = await tx.viewDefinition.findMany({ where: { workspaceId: fixture.workspaceId }, orderBy: { id: "asc" } });
  check(views.length === fixture.views.length, "VIEW_COUNT_CHANGED");
  for (const expected of fixture.views) {
    const actual = views.find(view => view.id === expected.id);
    check(actual && actual.objectDefinitionId === expected.objectDefinitionId && actual.listDefinitionId === expected.listDefinitionId, "VIEW_IDENTITY_CHANGED");
    const next = changes[expected.type];
    check(actual.name === expected.name && actual.type === expected.type || next && actual.name === next.name && actual.type === next.type, "VIEW_EDITED");
  }
  const converted = fixture.views.filter(view => changes[view.type]).filter(expected => views.find(view => view.id === expected.id)?.type === changes[expected.type].type).length;
  check(converted === 0 || converted === targetIds.length, "PARTIALLY_CONVERTED");
  const rows = {};
  for (const model of changedModels.slice(1)) rows[model] = await tx[delegate(model)].findMany({ where: { workspaceId: fixture.workspaceId }, orderBy: { id: "asc" } });
  return { views, rows, converted };
}
// 기능 : 기존 표시 역할과 ID를 보존하고 없는 제목만 같은 원본의 TABLE에서 보충합니다.
function plan(current) {
  const patches = [], creations = [], removals = [], report = [];
  if (current.converted) return { patches, creations, removals, report };
  for (const expected of fixture.views.filter(view => changes[view.type])) {
    const view = current.views.find(row => row.id === expected.id);
    const next = changes[expected.type];
    patches.push({ model: "ViewDefinition", row: view, data: { ...next, configJson: next.type === "KANBAN" ? { cardDensity: "COMFORTABLE", showEmptyGroups: true } : { rowDensity: "COMFORTABLE" } } });
    const base = current.views.find(row => row.type === "TABLE" && (view.listDefinitionId ? row.listDefinitionId === view.listDefinitionId : row.objectDefinitionId === view.objectDefinitionId));
    check(base, "BASE_TABLE_MISSING");
    let bindings = current.rows.ViewAttributeSettingDefinition.filter(row => row.viewDefinitionId === view.id).sort((a, b) => a.sortOrder - b.sortOrder || a.createdAt - b.createdAt || a.id.localeCompare(b.id));
    // 1. 대시보드의 실제 원본 목록을 구성하고 차트/피벗에 Record 제목을 보충한다.
    const templates = current.rows.ViewAttributeSettingDefinition.filter(row => row.viewDefinitionId === base.id).sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id));
    if (!bindings.length) bindings = templates.map(row => ({ ...row, id: randomUUID(), viewDefinitionId: view.id, createdByActorId: view.createdByActorId, updatedByActorId: null }));
    if (!bindings.some(row => row.attributeDisplayRole === "TITLE")) {
      const title = templates.find(row => row.attributeDisplayRole === "TITLE" && !row.isHidden);
      check(title, "TITLE_TEMPLATE_MISSING");
      bindings.unshift({ ...title, id: randomUUID(), viewDefinitionId: view.id, createdByActorId: view.createdByActorId, updatedByActorId: null });
    }
    bindings.forEach((row, index) => {
      const data = { sortOrder: index, attributeDisplayRole: row.attributeDisplayRole === "TITLE" ? "TITLE" : next.type === "LIST" && row.attributeDisplayRole === "BODY" ? "BODY" : "DISPLAY" };
      if (current.rows.ViewAttributeSettingDefinition.some(existing => existing.id === row.id)) {
        if (Object.entries(data).some(([key, value]) => row[key] !== value)) patches.push({ model: "ViewAttributeSettingDefinition", row, data });
      } else {
        const { createdAt, updatedAt, ...columns } = row;
        creations.push({ model: "ViewAttributeSettingDefinition", data: { ...columns, ...data } });
      }
    });
    // 2. 피벗의 두 축을 일반 그룹으로 유지하고 대시보드 배치는 백업 후 해제한다.
    for (const row of current.rows.ViewGroupDefinition.filter(row => row.viewDefinitionId === view.id && row.groupRole !== "GROUP")) patches.push({ model: "ViewGroupDefinition", row, data: { groupRole: "GROUP" } });
    for (const row of current.rows.ViewWidgetDefinition.filter(row => row.viewDefinitionId === view.id)) removals.push({ model: "ViewWidgetDefinition", row });
    report.push({ id: view.id, oldName: view.name, oldType: view.type, newName: next.name, newType: next.type, bindings: bindings.length });
  }
  return { patches, creations, removals, report };
}
// 기능 : SQL NULL과 JSON 객체를 기존 Prisma 저장 계약에 맞춰 전달합니다.
function dataForPrisma(data) {
  return Object.fromEntries(Object.entries(data).map(([key, value]) => [key, value === null && ["configJson", "formatJson"].includes(key) ? Prisma.DbNull : value]));
}
// 기능 : 같은 snapshot의 실제 설정·값과 공개 Query Port로 모든 View 본문을 검증합니다.
async function verifyReaders(client, context, views, pending = null) {
  const tx = resolvePrismaReadContext(context);
  const query = new PrismaViewDataConfigurationQueryRepository();
  const loader = new ViewDataLoader(query, new PrismaRecordDataQueryRepository(client), new PrismaListEntryDataQueryRepository(client), new PrismaObjectDefinitionSummaryQueryRepository(client), new PrismaAttributeDefinitionMetadataQueryRepository(client), new PrismaAttributeRelationshipQueryRepository(), new PrismaWorkspaceSnapshotQueryRepository());
  const reader = new PrismaViewHeaderConfigurationQueryRepository(tx);
  const codec = new EncryptedViewDataTokenCodec("view-type-conversion-validation-only");
  const results = [];
  for (const view of views) {
    const scope = { workspaceId: view.workspaceId, viewDefinitionId: view.id };
    // 1. plan에서는 사본에만 변경을 적용하고 저장 검증은 실제 새 설정을 읽는다.
    const definition = await reader.findView(scope);
    const { viewWidgetDefinitions, ...settings } = await reader.findSettings(scope);
    const config = { view: definition, ...settings, ...await reader.findFilters(scope), viewSortDefinitions: await reader.findSorts(scope) };
    if (pending) {
      for (const patch of pending.patches.filter(item => item.row.id === view.id && item.model === "ViewDefinition")) Object.assign(config.view, patch.data);
      for (const [model, key] of [["ViewAttributeSettingDefinition", "viewAttributeSettingDefinitions"], ["ViewGroupDefinition", "viewGroupDefinitions"]]) {
        config[key] = config[key].map(row => ({ ...row, ...pending.patches.find(item => item.model === model && item.row.id === row.id)?.data }));
        config[key].push(...pending.creations.filter(item => item.model === model && item.data.viewDefinitionId === view.id).map(item => item.data));
        config[key].sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id));
      }
    } else check(viewWidgetDefinitions.length === 0, "WIDGETS_REMAIN");
    const request = { sourceType: view.listDefinitionId ? "LIST" : "OBJECT", limit: 100 };
    try {
      const snapshot = await loader.load(config, resolveViewSource(config.view, request), context);
      const response = readViewData(new ViewDataQueryContext(snapshot, request, { id: "view-type-validation-only", timeZone: "Asia/Seoul" }, codec));
      check(response.state === "READY", "VIEW_NOT_READY");
      results.push({ id: view.id, name: config.view.name, type: config.view.type, state: response.state, summary: response.summary });
    } catch (error) {
      check(false, "READER_" + view.id + "_" + (typeof error.code === "string" ? error.code : "FAILED"));
    }
  }
  return results;
}
// 기능 : 변경 모델의 사후 digest가 맞을 때만 실행할 수 있는 복구 SQL을 만듭니다.
function recoveryStatements(before, after, pending) {
  // 기능 : 모델 전체 digest가 다르면 이후 사용자 편집을 덮지 않도록 복구를 중단합니다.
  function guards(expected) {
    return Object.entries(expected).map(([model, fingerprint]) => `DO $guard$ BEGIN IF (SELECT md5(COALESCE(string_agg(to_jsonb(t)::text, '' ORDER BY t."id"), '')) FROM "${model}" t) <> ${literal(fingerprint.digest)} THEN RAISE EXCEPTION 'VIEW_TYPE_RECOVERY_STATE_CHANGED_${model}'; END IF; END $guard$;`);
  }
  const sql = ["-- 승인한 View 전환만 복구합니다. 이후 설정 변경이 있으면 중단합니다.", "BEGIN;", "SET LOCAL lock_timeout = '5s';", `LOCK TABLE ${changedModels.map(model => '"' + model + '"').join(", ")} IN SHARE ROW EXCLUSIVE MODE;`, ...guards(after)];
  for (const { model, data } of pending.creations) sql.push(`DELETE FROM "${model}" WHERE "id" = ${literal(data.id)}::uuid;`);
  for (const { model, row, data } of pending.patches) {
    const columns = [...Object.keys(data), "updatedAt"];
    sql.push(`UPDATE "${model}" t SET (${columns.map(key => '"' + key + '"').join(", ")}) = (SELECT ${columns.map(key => 'r."' + key + '"').join(", ")} FROM jsonb_populate_record(NULL::"${model}", ${literal(JSON.stringify(row))}::jsonb) r) WHERE t."id" = ${literal(row.id)}::uuid;`);
  }
  for (const { model, row } of pending.removals) sql.push(`INSERT INTO "${model}" SELECT * FROM jsonb_populate_record(NULL::"${model}", ${literal(JSON.stringify(row))}::jsonb);`);
  sql.push(...guards(before), "COMMIT;", "");
  return sql;
}
// 기능 : 변경 전 행·계획·보호 digest를 인증정보 없는 로컬 백업으로 먼저 보관합니다.
function backup(current, pending, fingerprints, hashes) {
  const path = resolve(repository, "TEMP", "view-type-conversion-" + new Date().toISOString().replaceAll(":", "-") + "-" + mode);
  mkdirSync(path, { recursive: true, mode: 0o700 });
  writeFileSync(resolve(path, "before.json"), JSON.stringify({ capturedAt: new Date().toISOString(), workspaceId: fixture.workspaceId, current, pending, fingerprints, environmentHashes: hashes }, null, 2), { flag: "wx", mode: 0o600, flush: true });
  return path;
}
// 기능 : 전환할 설정 이외의 모든 행과 기존 View의 식별·원본·생성 정보를 검사합니다.
async function verifyWrites(tx, pending, untouched) {
  for (const item of pending.patches) {
    const actual = await tx[delegate(item.model)].findUnique({ where: { id: item.row.id } });
    check(actual, "UPDATED_ROW_MISSING");
    for (const [key, value] of Object.entries(item.row)) if (key !== "updatedAt") check(canonical(actual[key]) === canonical(Object.hasOwn(item.data, key) ? item.data[key] : value), "UNEXPECTED_FIELD_CHANGE");
  }
  const excluded = {};
  for (const { model, row } of [...pending.patches, ...pending.removals]) (excluded[model] ??= []).push(row.id);
  for (const { model, data } of pending.creations) (excluded[model] ??= []).push(data.id);
  check(canonical(untouched) === canonical(await digests(tx, [...protectedModels, ...changedModels], excluded)), "UNTOUCHED_ROWS_CHANGED");
}
// 기능 : 읽기 계획 또는 백업·검증을 포함한 단일 transaction을 실행합니다.
async function run(client, hashes) {
  const readOnly = mode === "plan" || mode === "verify";
  const transaction = readOnly ? new PrismaReadSnapshotRunner(client) : new PrismaTransactionManager({ $transaction: work => client.$transaction(work, { isolationLevel: "Serializable", timeout: 60000, maxWait: 10000 }) });
  const execute = readOnly ? transaction.run.bind(transaction) : transaction.runInTransaction.bind(transaction);
  let summary, baseline;
  try {
    return await execute(async context => {
      const tx = resolvePrismaReadContext(context);
      if (!readOnly) {
        // 1. 같은 Workspace의 유지보수를 직렬화하고 변경 테이블의 동시 쓰기를 잠시 막는다.
        stage = "lock";
        await tx.$executeRawUnsafe("SET LOCAL lock_timeout = '5s'");
        await tx.$queryRaw(Prisma.sql`SELECT pg_advisory_xact_lock(hashtextextended(${fixture.workspaceId + "/view-type-conversion"}, 0))::text`);
        await tx.$executeRawUnsafe(`LOCK TABLE ${changedModels.map(model => '"' + model + '"').join(", ")} IN SHARE ROW EXCLUSIVE MODE`);
      }
      stage = "read-state";
      const current = await state(tx);
      const pending = plan(current);
      if (mode === "verify") check(current.converted === targetIds.length, "NOT_CONVERTED");
      if (readOnly || current.converted) return { mode, changed: 0, pendingUpdates: pending.patches.length, pendingInserts: pending.creations.length, pendingWidgetRemovals: pending.removals.length, conversions: pending.report, results: await verifyReaders(client, context, current.views, current.converted ? null : pending) };
      // 2. 실제 수정 전에 원본과 복구에 필요한 행을 저장하고 허용 범위 밖 digest를 고정한다.
      stage = "before-digests";
      baseline = await digests(tx, [...protectedModels, ...changedModels]);
      const excluded = {};
      for (const { model, row } of [...pending.patches, ...pending.removals]) (excluded[model] ??= []).push(row.id);
      const untouched = await digests(tx, [...protectedModels, ...changedModels], excluded);
      const path = backup(current, pending, baseline, hashes);
      stage = "write";
      for (const { model, row, data } of pending.patches) await tx[delegate(model)].update({ where: { id: row.id }, data: dataForPrisma(data) });
      for (const { model, data } of pending.creations) await tx[delegate(model)].create({ data: dataForPrisma(data) });
      for (const { model, row } of pending.removals) await tx[delegate(model)].delete({ where: { id: row.id } });
      // 3. 같은 transaction에서 모든 본문 실행·보존 필드·정확한 최종 타입을 검증한다.
      stage = "verify";
      const after = await state(tx);
      const results = await verifyReaders(client, context, after.views);
      await verifyWrites(tx, pending, untouched);
      check(canonical(hashes) === canonical(environment().hashes), "ENV_CHANGED");
      const fingerprints = await digests(tx, changedModels);
      const distribution = Object.fromEntries(["TABLE", "KANBAN", "LIST"].map(type => [type, after.views.filter(view => view.type === type).length]));
      check(canonical(distribution) === canonical({ TABLE: 18, KANBAN: 2, LIST: 4 }), "FINAL_TYPE_COUNT");
      check(await tx.viewDefinition.count({ where: { type: { notIn: ["TABLE", "KANBAN", "LIST"] } } }) === 0, "UNSUPPORTED_VIEWS_REMAIN");
      const beforeChanged = Object.fromEntries(changedModels.map(model => [model, baseline[model]]));
      const recovery = recoveryStatements(beforeChanged, fingerprints, pending);
      writeFileSync(resolve(path, "restore.sql"), recovery.join("\n"), { flag: "wx", mode: 0o600, flush: true });
      summary = { mode, backup: path, convertedViews: pending.report.length, updatedRows: pending.patches.length, insertedBindings: pending.creations.length, removedDashboardWidgets: pending.removals.length, distribution, conversions: pending.report, results, untouchedRowsPreserved: true, environmentPreserved: true };
      writeFileSync(resolve(path, "validated.json"), JSON.stringify(summary, null, 2), { flag: "wx", mode: 0o600, flush: true });
      if (mode === "rehearse") {
        // 4. 복구 SQL도 같은 transaction 안에서 검증한 다음 전체 작업을 rollback한다.
        stage = "recovery";
        for (const statement of recovery.filter(sql => sql && !sql.startsWith("--") && !["BEGIN;", "COMMIT;"].includes(sql))) await tx.$executeRawUnsafe(statement);
        check(canonical(baseline) === canonical(await digests(tx, [...protectedModels, ...changedModels])), "RECOVERY_SQL_FAILED");
        summary.recoverySqlVerified = true;
        throw rollbackMarker;
      }
      return summary;
    });
  } catch (error) {
    if (error !== rollbackMarker) throw error;
    const actual = await new PrismaReadSnapshotRunner(client).run(context => digests(resolvePrismaReadContext(context), [...protectedModels, ...changedModels]));
    check(canonical(actual) === canonical(baseline), "REHEARSAL_ROLLBACK_FAILED");
    return { ...summary, committedRows: 0, rollbackVerified: true };
  }
}
// 기능 : 기본 읽기 계획과 명시한 실행 모드를 구분하고 비밀정보 없이 결과를 보고합니다.
async function main() {
  check(modes.includes(mode), "INVALID_MODE");
  const env = environment();
  const client = new PrismaClient({ datasources: { db: { url: env.values.DATABASE_URL } }, log: [] });
  try {
    const result = await run(client, env.hashes);
    check(canonical(env.hashes) === canonical(environment().hashes), "ENV_CHANGED");
    process.stdout.write(JSON.stringify(result, null, 2) + "\n");
  } finally { await client.$disconnect(); }
}
main().catch(error => {
  process.stderr.write(JSON.stringify({ error: typeof error.message === "string" && error.message.startsWith("VIEW_TYPE_CONVERSION_") ? error.message : "VIEW_TYPE_CONVERSION_FAILED", code: typeof error.code === "string" ? error.code : null, stage, databaseCode: typeof error.meta?.code === "string" ? error.meta.code : null, recoveryGuard: String(error.meta?.message ?? "").match(/VIEW_TYPE_RECOVERY_STATE_CHANGED_[A-Za-z]+/)?.[0] ?? null }) + "\n");
  process.exitCode = 1;
});

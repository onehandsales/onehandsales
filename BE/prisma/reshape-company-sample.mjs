import { createHash, randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseEnv } from "node:util";
import { Prisma, PrismaClient } from "@prisma/client";

// 역할 : 승인된 비교용 Workspace를 회사 중심으로 전환하고 복구·조회·쓰기 리허설을 검증합니다.
// 실행 : node prisma/reshape-company-sample.mjs plan <workspace UUID>
// 실행 : node prisma/reshape-company-sample.mjs rehearse|apply|verify <TEMP 계획 폴더>
// 현재 snapshot과 다른 편집이 발견되면 중단합니다. 자동 복구나 전체 DB 초기화는 하지 않습니다.
const be = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = resolve(be, "..");
const require = createRequire(import.meta.url);
require("ts-node").register({ project: resolve(be, "tsconfig.json"), transpileOnly: true });
const paths = require("tsconfig-paths");
const configPaths = paths.loadConfig(be);
paths.register({ baseUrl: configPaths.absoluteBaseUrl, paths: configPaths.paths });
const load = file => require(resolve(be, "src", file));
const { PrismaTransactionManager, resolvePrismaReadContext } = load("shared/infrastructure/prisma/prisma-transaction-manager.ts");
const models = ["ObjectDefinition", "ListDefinition", "AttributeDefinition", "SelectOption", "StatusOption", "RecordDefinition", "RecordAttributeValueDefinition", "RelationshipDefinition", "ListEntryDefinition", "ListEntryValueDefinition", "ViewDefinition", "ViewAttributeSettingDefinition", "ViewFilterGroupDefinition", "ViewFilterConditionDefinition", "ViewSortDefinition", "ViewGroupDefinition", "ViewGroupSettingDefinition", "ViewWidgetDefinition", "ViewWorkDependencyDefinition", "ViewFavoriteDefinition"];
const removalOrder = [...models].reverse();
const delegate = name => name[0].toLowerCase() + name.slice(1);
const quote = name => '"' + name.replaceAll('"', '""') + '"';
const plain = value => JSON.parse(JSON.stringify(value));
// 기능 : 업무 원문을 출력하지 않고 동일 snapshot인지 확인합니다.
function canonical(value) {
  const sort = v => Array.isArray(v) ? v.map(sort) : v && typeof v === "object" ? Object.fromEntries(Object.keys(v).sort().map(k => [k, sort(v[k])])) : v;
  return JSON.stringify(sort(plain(value)));
}
const digest = value => createHash("sha256").update(canonical(value)).digest("hex");
function check(value, code) { if (!value) throw Object.assign(new Error(code), { safeCode: code }); }
function save(path, value) { writeFileSync(path, JSON.stringify(value, null, 2), { flag: "wx", mode: 0o600, flush: true }); }
// 기능 : 접속 비밀값은 메모리에서만 사용하고 파일 변경 여부만 기록합니다.
function environment() {
  const values = {}, hashes = {};
  for (const name of [".env", ".env.local"]) {
    const file = resolve(be, name); if (!existsSync(file)) continue;
    const content = readFileSync(file, "utf8"); Object.assign(values, parseEnv(content)); hashes[name] = digest(content);
  }
  for (const key of ["DIRECT_URL", "DATABASE_URL"]) if (process.env[key]) values[key] = process.env[key];
  const url = new URL(values.DIRECT_URL || values.DATABASE_URL);
  check(/(^|\.)supabase\.(co|com)$/.test(url.hostname), "SUPABASE_CONNECTION_REQUIRED");
  url.searchParams.set("connection_limit", "2"); url.searchParams.set("connect_timeout", "10");
  return { url: url.toString(), hashes, identity: digest([url.hostname, url.pathname]) };
}
// 기능 : 대상 업무 행만 백업하며 인증 정보와 사용자 개인정보는 포함하지 않습니다.
async function snapshot(tx, workspaceId) {
  const rows = {};
  for (const model of models) rows[model] = plain(await tx[delegate(model)].findMany({ where: { workspaceId }, orderBy: { id: "asc" } }));
  return rows;
}
// 기능 : 변경 대상 외 업무 행과 기반 모델·migration 이력의 보존을 확인합니다.
async function protectedDigest(tx, workspaceId) {
  const result = {};
  for (const model of Prisma.dmmf.datamodel.models) {
    const scoped = models.includes(model.name);
    const where = scoped ? ' WHERE "workspaceId" <> $1::uuid' : "";
    const sql = `SELECT count(*)::int AS count, md5(COALESCE(string_agg(to_jsonb(t)::text, '' ORDER BY id), '')) AS digest FROM public.${quote(model.dbName || model.name)} t${where}`;
    [result[model.name]] = await tx.$queryRawUnsafe(sql, ...(scoped ? [workspaceId] : []));
  }
  [result.migrations] = await tx.$queryRawUnsafe(`SELECT count(*)::int AS count, md5(COALESCE(string_agg(to_jsonb(t)::text, '' ORDER BY id), '')) AS digest FROM public."_prisma_migrations" t`);
  return result;
}
// 기능 : 현재 회사 신원과 수정값을 보존하면서 회사 기반 두 업무 목록을 구성합니다.
function buildAfter(before, scope) {
  const after = structuredClone(before), now = new Date().toISOString();
  const { workspaceId, actorId, memberId } = scope;
  const audit = { workspaceId, createdByActorId: actorId, updatedByActorId: actorId, createdAt: now, updatedAt: now };
  const insert = (model, template, fields) => { const row = { ...structuredClone(template), ...audit, id: randomUUID(), ...fields }; after[model].push(row); return row; };
  const patch = (row, fields) => Object.assign(row, fields, { updatedAt: now, updatedByActorId: actorId });
  const remove = (model, test) => { after[model] = after[model].filter(row => !test(row)); };
  const company = after.ObjectDefinition.find(o => o.apiSlug === "companies");
  const sales = after.ObjectDefinition.find(o => o.apiSlug === "sales");
  const pipeline = after.ListDefinition.find(l => l.apiSlug === "sales-pipeline");
  check(company && sales && pipeline && after.ObjectDefinition.length === 2 && after.ListDefinition.length === 1, "EXPECTED_SAMPLE_OBJECTS");
  const ca = Object.fromEntries(after.AttributeDefinition.filter(a => a.objectDefinitionId === company.id).map(a => [a.apiSlug, a]));
  const pa = Object.fromEntries(after.AttributeDefinition.filter(a => a.listDefinitionId === pipeline.id).map(a => [a.apiSlug, a]));
  check(ca.name && ca.sales && pa.stage && pa.memo, "EXPECTED_SAMPLE_ATTRIBUTES");
  const companyRows = after.RecordDefinition.filter(r => r.objectDefinitionId === company.id);
  const title = r => before.RecordAttributeValueDefinition.find(v => v.recordDefinitionId === r.id && v.attributeDefinitionId === ca.name.id)?.textValue;
  const original = ["OpenAI", "SAMSUNG", "SK HYNIX"].map(name => companyRows.find(r => title(r) === name));
  const empty = companyRows.filter(r => !title(r));
  check(original.every(Boolean) && companyRows.length === 4 && empty.length === 1, "EXPECTED_COMPANY_RECORDS");
  const valueFields = ["jsonValue", "textValue", "numberValue", "booleanValue", "dateValue", "timestampValue", "selectOptionId", "statusOptionId", "targetRecordDefinitionId", "targetObjectDefinitionId", "targetActorId"];
  check(before.RecordAttributeValueDefinition.filter(v => v.recordDefinitionId === empty[0].id).every(v => valueFields.every(k => v[k] === null)), "UNNAMED_RECORD_WAS_EDITED");
  const blankValue = Object.fromEntries(valueFields.map(k => [k, null]));
  const encode = (type, value) => {
    const out = { ...blankValue }; if (value === null) return out;
    const field = { Text: "textValue", Domain: "textValue", EmailAddress: "textValue", PhoneNumber: "textValue", Currency: "numberValue", Number: "numberValue", Checkbox: "booleanValue", Date: "dateValue", Select: "selectOptionId", Status: "statusOptionId", ActorReference: "targetActorId" }[type];
    check(field, "UNSUPPORTED_SAMPLE_TYPE"); out[field] = type === "Date" ? value + "T00:00:00.000Z" : value; return out;
  };
  const attribute = (owner, slug, name, type, order, extra = {}) => insert("AttributeDefinition", before.AttributeDefinition[0], {
    objectDefinitionId: owner === company.id ? company.id : null, listDefinitionId: owner === company.id ? null : owner,
    apiSlug: slug, title: name, type, sortOrder: order, isMultiselect: false, configJson: null, icon: null, description: "화면 입력·저장 검증용 샘플 속성", ...extra,
  });
  const setRecordValue = (record, attr, value) => {
    const existing = after.RecordAttributeValueDefinition.find(v => v.recordDefinitionId === record.id && v.attributeDefinitionId === attr.id);
    const fields = { objectDefinitionId: company.id, recordDefinitionId: record.id, attributeDefinitionId: attr.id, attributeType: attr.type, ...encode(attr.type, value) };
    return existing ? patch(existing, fields) : insert("RecordAttributeValueDefinition", before.RecordAttributeValueDefinition[0], fields);
  };
  const companyView = after.ViewDefinition.find(v => v.objectDefinitionId === company.id);
  const salesView = after.ViewDefinition.find(v => v.objectDefinitionId === sales.id);
  const pipelineView = after.ViewDefinition.find(v => v.listDefinitionId === pipeline.id);
  check(companyView?.type === "TABLE" && salesView?.type === "LIST" && pipelineView?.type === "KANBAN" && after.ViewDefinition.length === 3, "EXPECTED_SAMPLE_VIEWS");
  check(after.ViewWidgetDefinition.length === 0 && after.ViewWorkDependencyDefinition.length === 0 && after.ViewFilterConditionDefinition.length === 0 && after.ViewFilterGroupDefinition.length === 0, "UNEXPECTED_VIEW_CONFIGURATION");
  const obsoleteAttributes = new Set(after.AttributeDefinition.filter(a => a.objectDefinitionId === sales.id || a.id === ca.sales.id).map(a => a.id));
  const obsoleteRecords = new Set(after.RecordDefinition.filter(r => r.objectDefinitionId === sales.id).map(r => r.id));
  check(obsoleteRecords.size === 9 && before.RelationshipDefinition.length === 1, "EXPECTED_SALES_RECORDS_AND_RELATION");
  remove("RelationshipDefinition", r => r.sourceObjectDefinitionId === sales.id || r.targetObjectDefinitionId === sales.id);
  remove("RecordAttributeValueDefinition", v => obsoleteRecords.has(v.recordDefinitionId) || obsoleteAttributes.has(v.attributeDefinitionId));
  remove("SelectOption", o => obsoleteAttributes.has(o.attributeDefinitionId));
  remove("StatusOption", o => obsoleteAttributes.has(o.attributeDefinitionId));
  remove("AttributeDefinition", a => obsoleteAttributes.has(a.id));
  remove("RecordDefinition", r => obsoleteRecords.has(r.id));
  remove("ObjectDefinition", o => o.id === sales.id);
  remove("ViewAttributeSettingDefinition", b => obsoleteAttributes.has(b.attributeDefinitionId) || b.viewDefinitionId === salesView.id || b.viewDefinitionId === pipelineView.id);
  remove("ViewSortDefinition", s => s.viewDefinitionId === salesView.id);
  patch(company, { description: "회사 중심 CRM 검증용 관리 항목. 회사명·공식 도메인 외 업무 정보는 샘플입니다." });
  patch(ca.category, { title: "고객 구분" }); patch(ca.registered_on, { title: "등록일" }); patch(ca.owner, { title: "담당자" });
  const email = attribute(company.id, "contact_email", "대표 이메일", "EmailAddress", 7);
  const phone = attribute(company.id, "contact_phone", "대표 전화", "PhoneNumber", 8);
  const employees = attribute(company.id, "employee_count", "직원 수", "Number", 9);
  const newCompanies = [empty[0], insert("RecordDefinition", before.RecordDefinition[0], { objectDefinitionId: company.id }), insert("RecordDefinition", before.RecordDefinition[0], { objectDefinitionId: company.id })];
  const category = key => before.SelectOption.find(o => o.attributeDefinitionId === ca.category.id && o.title === key).id;
  const samples = [
    { name: "정담솔루션", domain: "jeongdam.example", category: "신규", important: true, date: "2026-11-09", memo: "[가상 회사] 고객 관리 도구 도입 상담. 운영 담당자에게 비교 자료 전달 예정.", email: "hello@jeongdam.example", phone: null, count: "24" },
    { name: "새봄교육", domain: "saebom-edu.example", category: "기존", important: false, date: "2026-10-27", memo: "[가상 회사] 지점별 상담 기록을 통합 관리. 사용 담당자 교육 일정 협의 중.", email: "operations@saebom-edu.example", phone: null, count: "0" },
    { name: "다온리테일", domain: "daon-retail.example", category: "검토", important: false, date: "2026-11-12", memo: "[가상 회사] 매장별 고객 관리 방식 검토. 예산과 도입 일정은 미정.", email: null, phone: null, count: null },
  ];
  newCompanies.forEach((record, i) => {
    const s = samples[i]; patch(record, {});
    for (const [key, value] of Object.entries({ name: s.name, domain: s.domain, category: category(s.category), owner: i === 2 ? null : actorId, important: s.important, registered_on: s.date, memo: s.memo })) setRecordValue(record, ca[key], value);
  });
  const allCompanies = [...original, ...newCompanies];
  allCompanies.forEach((r, i) => { setRecordValue(r, email, i < 3 ? null : samples[i - 3].email); setRecordValue(r, phone, null); setRecordValue(r, employees, i < 3 ? null : samples[i - 3].count); });
  const onboarding = insert("ListDefinition", before.ListDefinition[0], { apiSlug: "customer-onboarding", name: "고객 온보딩", description: "회사를 직접 참조하는 도입·교육·정착 업무 목록. 샘플 업무 정보입니다.", sortOrder: 1, icon: "clipboard-check" });
  patch(pipeline, { description: "회사 Record를 직접 참조하는 영업 업무 목록. 단계·금액·연락 일정은 이 목록에만 저장합니다." });
  const amount = attribute(pipeline.id, "expected_amount", "예상 금액", "Currency", 5, { configJson: { currency: { defaultCurrencyCode: "KRW" } } });
  const priority = attribute(pipeline.id, "priority", "우선순위", "Select", 6);
  const priorityOptions = ["높음", "보통", "낮음"].map((title, i) => insert("SelectOption", before.SelectOption[0], { attributeDefinitionId: priority.id, title, sortOrder: i, color: ["orange", "blue", "gray"][i] }));
  const oa = [attribute(onboarding.id, "stage", "온보딩 단계", "Status", 0), attribute(onboarding.id, "started_on", "시작일", "Date", 1), attribute(onboarding.id, "due_on", "목표 완료일", "Date", 2), attribute(onboarding.id, "owner", "담당자", "ActorReference", 3), attribute(onboarding.id, "materials_received", "자료 수령", "Checkbox", 4), attribute(onboarding.id, "memo", "온보딩 메모", "Text", 5)];
  const onboardingOptions = ["준비", "설정 중", "사용자 교육", "완료"].map((title, i) => insert("StatusOption", before.StatusOption[0], { attributeDefinitionId: oa[0].id, title, sortOrder: i, color: ["gray", "blue", "purple", "green"][i] }));
  const setEntryValue = (entry, attr, value) => {
    const existing = after.ListEntryValueDefinition.find(v => v.listEntryDefinitionId === entry.id && v.attributeDefinitionId === attr.id);
    const fields = { listDefinitionId: entry.listDefinitionId, listEntryDefinitionId: entry.id, attributeDefinitionId: attr.id, attributeType: attr.type, ...encode(attr.type, value) };
    return existing ? patch(existing, fields) : insert("ListEntryValueDefinition", before.ListEntryValueDefinition[0], fields);
  };
  const entries = after.ListEntryDefinition.filter(e => e.listDefinitionId === pipeline.id);
  check(entries.length === 6, "EXPECTED_PIPELINE_ENTRIES");
  const stageNames = ["제안", "상담", "협상", "문의", "보류", null];
  const amounts = ["12000000", "0", "32000000", "2400000", "6000000", null];
  entries.forEach((entry, i) => {
    patch(entry, { recordDefinitionId: allCompanies[i].id });
    const status = stageNames[i] ? before.StatusOption.find(o => o.attributeDefinitionId === pa.stage.id && o.title === stageNames[i]).id : null;
    for (const [attr, value] of [[pa.stage, status], [pa.next_contact_on, i < 4 ? `2026-11-${16 + i}` : null], [pa.focus, i === 0 || i === 2], [pa.reviewer, i === 5 ? null : actorId], [pa.memo, ["[샘플] 제안서 전달 후 의사결정 일정 확인", "[샘플] 무료 평가 범위와 담당 부서 확인", "[샘플] 계약 조건 검토 및 보안 자료 전달", "[샘플] 현재 업무 방식과 필수 요구사항 파악", "[샘플] 다음 예산 편성 시점에 다시 연락", "[샘플] 담당자·예산·일정 확인 전"] [i]], [amount, amounts[i]], [priority, priorityOptions[i === 0 || i === 2 ? 0 : i === 4 ? 2 : 1].id]]) setEntryValue(entry, attr, value);
  });
  const onboardingRecords = [original[1], newCompanies[0], newCompanies[1]];
  onboardingRecords.forEach((record, i) => {
    const entry = insert("ListEntryDefinition", before.ListEntryDefinition[0], { listDefinitionId: onboarding.id, recordDefinitionId: record.id });
    const vals = [onboardingOptions[[0, 1, 3][i]].id, [null, "2026-11-10", "2026-10-28"][i], ["2026-11-30", "2026-11-20", "2026-11-11"][i], actorId, i !== 0, ["[샘플] 평가용 Workspace 준비 및 담당자 초대 일정 확인", "[샘플] 기존 회사 목록 정리 후 초기 데이터 입력", "[샘플] 담당자 교육 완료. 첫 사용 피드백 수집 예정"][i]];
    oa.forEach((a, index) => setEntryValue(entry, a, vals[index]));
  });
  patch(salesView, { name: "온보딩 현황", objectDefinitionId: null, listDefinitionId: onboarding.id, description: "회사별 도입 진행을 확인하는 목록", configJson: { rowDensity: "COMFORTABLE" } });
  patch(pipelineView, { name: "회사별 진행 단계", description: "회사별 영업 진행 단계. 회사 정보와 목록 정보를 함께 표시합니다." });
  const bind = (view, attr, order, role = "DISPLAY", alias = null) => insert("ViewAttributeSettingDefinition", before.ViewAttributeSettingDefinition[0], {
    viewDefinitionId: view.id, attributeDefinitionId: attr.id, sourceScope: attr.listDefinitionId ? "LIST_ENTRY" : "RECORD", referenceAttributeIdPathJson: [], attributeDisplayRole: role,
    sortOrder: order, labelOverride: alias, width: role === "TITLE" ? 280 : 180, isHidden: false,
    formatJson: attr.type === "Currency" ? { useGrouping: true, fractionDigits: 0 } : attr.type === "Date" ? { dateFormat: "YYYY-MM-DD" } : null,
  });
  [email, phone, employees].forEach((a, i) => bind(companyView, a, 7 + i));
  [ca.name, ca.domain, ca.category, pa.stage, amount, priority, pa.next_contact_on, pa.focus, pa.reviewer, pa.memo].forEach((a, i) => bind(pipelineView, a, i, i === 0 ? "TITLE" : "DISPLAY"));
  [ca.name, ca.domain, oa[0], oa[1], oa[2], oa[3], oa[4], oa[5]].forEach((a, i) => bind(salesView, a, i, i === 0 ? "TITLE" : i === 7 ? "BODY" : "DISPLAY"));
  insert("ViewSortDefinition", before.ViewSortDefinition[0], { viewDefinitionId: salesView.id, sourceScope: "LIST_ENTRY", attributeDefinitionId: oa[2].id, referenceAttributeIdPathJson: [], sortDirection: "ASC", sortOrder: 0, configJson: { nulls: "LAST" } });
  check(after.ViewFavoriteDefinition.every(f => f.workspaceMemberId === memberId), "UNEXPECTED_FAVORITE_OWNER");
  for (const model of models) after[model].sort((a, b) => a.id.localeCompare(b.id));
  return { after, ids: { company: company.id, companyView: companyView.id, pipeline: pipeline.id, pipelineView: pipelineView.id, onboarding: onboarding.id, onboardingView: salesView.id }, preservedCompanyRecordIds: original.map(r => r.id) };
}
// 기능 : 추가·변경·제거를 분리하고 변경하지 않은 원본 행은 쓰지 않습니다.
function diff(from, to) {
  return Object.fromEntries(models.map(model => {
    const old = new Map(from[model].map(r => [r.id, r])), next = new Map(to[model].map(r => [r.id, r]));
    return [model, { add: to[model].filter(r => !old.has(r.id)), update: to[model].filter(r => old.has(r.id) && canonical(old.get(r.id)) !== canonical(r)), remove: from[model].filter(r => !next.has(r.id)) }];
  }));
}
// 기능 : SQL NULL인 JSON과 명시적인 원본 감사 시각을 보존합니다.
function prismaData(model, row) {
  const json = new Set(Prisma.dmmf.datamodel.models.find(m => m.name === model).fields.filter(f => f.type === "Json").map(f => f.name));
  return Object.fromEntries(Object.entries(row).map(([k, v]) => [k, v === null && json.has(k) ? Prisma.DbNull : v]));
}
async function applyDiff(tx, from, to) {
  const changes = diff(from, to);
  for (const model of models) for (const row of changes[model].add) await tx[delegate(model)].create({ data: prismaData(model, row) });
  for (const model of models) for (const row of changes[model].update) { const { id, ...data } = prismaData(model, row); await tx[delegate(model)].update({ where: { id, workspaceId: row.workspaceId }, data }); }
  for (const model of removalOrder) for (const row of changes[model].remove) await tx[delegate(model)].delete({ where: { id: row.id, workspaceId: row.workspaceId } });
  await tx.$executeRawUnsafe("SET CONSTRAINTS ALL IMMEDIATE");
}
// 기능 : 실제 Backend loader/reader로 저장한 세 View를 실행합니다.
async function verifyReaders(client, context, plan) {
  const make = (file, name, ...args) => new (load(file)[name])(...args);
  const query = make("modules/view-definition/infrastructure/persistence/prisma-view-data-configuration-query.repository.ts", "PrismaViewDataConfigurationQueryRepository");
  const loader = make("modules/view-definition/application/view-data/view-data-loader.ts", "ViewDataLoader", query,
    make("modules/record-definition/infrastructure/persistence/prisma-record-data-query.repository.ts", "PrismaRecordDataQueryRepository", client),
    make("modules/list-definition/infrastructure/persistence/prisma-list-entry-data-query.repository.ts", "PrismaListEntryDataQueryRepository", client),
    make("modules/object-definition/infrastructure/persistence/prisma-object-definition-summary-query.repository.ts", "PrismaObjectDefinitionSummaryQueryRepository", client),
    make("modules/attribute-definition/infrastructure/persistence/prisma-attribute-definition-metadata-query.repository.ts", "PrismaAttributeDefinitionMetadataQueryRepository", client),
    make("modules/attribute-definition/infrastructure/persistence/prisma-attribute-relationship-query.repository.ts", "PrismaAttributeRelationshipQueryRepository"),
    make("modules/workspace/infrastructure/persistence/prisma-workspace-snapshot-query.repository.ts", "PrismaWorkspaceSnapshotQueryRepository"));
  const { resolveViewSource } = load("modules/view-definition/application/view-data/view-data-loader.ts");
  const { ViewDataQueryContext } = load("modules/view-definition/application/view-data/view-data-query-context.ts");
  const { readViewData } = load("modules/view-definition/application/view-data/view-data-readers.ts");
  const codec = make("modules/view-definition/infrastructure/view-data-token-codec.ts", "EncryptedViewDataTokenCodec", "company-sample-reader-validation-only");
  const result = [];
  for (const view of plan.after.ViewDefinition) {
    const config = await query.read({ workspaceId: plan.workspaceId, viewDefinitionId: view.id }, context);
    const request = { sourceType: view.listDefinitionId ? "LIST" : "OBJECT", limit: 100 };
    const data = await loader.load(config, resolveViewSource(config.view, request), context);
    const response = readViewData(new ViewDataQueryContext(data, request, { id: plan.userId, timeZone: "Asia/Seoul" }, codec));
    check(response.state === "READY", "VIEW_NOT_READY");
    const items = response.viewType === "KANBAN" ? response.data.columns.flatMap(c => c.items) : response.data.items;
    const expected = view.id === plan.ids.onboardingView ? 3 : view.id === plan.ids.companyView ? plan.expectedCompanyCount ?? 6 : 6;
    check(items.length === expected && items.every(item => item.objectDefinitionId === plan.ids.company), "VIEW_ITEM_COUNT_OR_SOURCE");
    check(items.every(item => item.cells.every(cell => !["INVALID", "UNAVAILABLE"].includes(cell.state))), "VIEW_INVALID_CELL");
    result.push({ name: view.name, type: view.type, state: response.state, items: items.length });
  }
  return result;
}
// 기능 : 실제 application/adapter의 컬럼·기록 저장을 실행하고 savepoint로 검증 흔적을 제거합니다.
async function verifyWrites(context, plan) {
  const tx = resolvePrismaReadContext(context);
  const make = (file, name, ...args) => new (load(file)[name])(...args);
  const logger = { log() {}, warn() {}, error() {} };
  const transactions = { runInTransaction: work => work(context) };
  const access = make("modules/workspace/infrastructure/persistence/prisma-workspace-access-query.repository.ts", "PrismaWorkspaceAccessQueryRepository", tx);
  const objects = make("modules/object-definition/infrastructure/persistence/prisma-object-definition-access-query.repository.ts", "PrismaObjectDefinitionAccessQueryRepository", tx);
  const attributes = make("modules/attribute-definition/infrastructure/persistence/prisma-attribute-definition-command.repository.ts", "PrismaAttributeDefinitionCommandRepository", tx);
  const metadata = make("modules/attribute-definition/infrastructure/persistence/prisma-attribute-definition-metadata-query.repository.ts", "PrismaAttributeDefinitionMetadataQueryRepository", tx);
  const materializer = make("modules/record-definition/infrastructure/persistence/prisma-record-attribute-value-definition-materializer.ts", "PrismaRecordAttributeValueDefinitionMaterializer", tx);
  const creator = make("modules/attribute-definition/application/use-cases/create-workspace-object-attribute-definition.use-case.ts", "CreateWorkspaceObjectAttributeDefinitionUseCase", access, objects, attributes, materializer, transactions, logger);
  const columns = make("modules/view-definition/infrastructure/persistence/prisma-view-column-command.repository.ts", "PrismaViewColumnCommandRepository", tx);
  const createColumn = make("modules/view-definition/application/use-cases/create-workspace-table-column.use-case.ts", "CreateWorkspaceTableColumnUseCase", access, objects, creator, metadata, columns, transactions, logger);
  const renameColumn = make("modules/view-definition/application/use-cases/update-workspace-view-column-label.use-case.ts", "UpdateWorkspaceViewColumnLabelUseCase", access, columns, transactions, logger);
  const updateAttribute = make("modules/attribute-definition/application/use-cases/update-workspace-object-attribute-definition.use-case.ts", "UpdateWorkspaceObjectAttributeDefinitionUseCase", access, objects, attributes, logger);
  const schema = make("modules/attribute-definition/infrastructure/persistence/prisma-record-attribute-schema-query.repository.ts", "PrismaRecordAttributeSchemaQueryRepository");
  const workspace = make("modules/workspace/infrastructure/persistence/prisma-workspace-snapshot-query.repository.ts", "PrismaWorkspaceSnapshotQueryRepository");
  const records = make("modules/record-definition/infrastructure/persistence/prisma-record-write.repository.ts", "PrismaRecordWriteRepository", tx);
  const writes = make("modules/record-definition/application/record-write.service.ts", "RecordWriteService", access, workspace, objects, schema, records, transactions, logger);
  const user = { id: plan.userId, sessionId: "sample-transaction-validation", email: null, displayName: null, platformRole: "USER", status: "ACTIVE", timeZone: "Asia/Seoul", defaultCurrencyCode: "KRW" };
  await tx.$executeRawUnsafe("SAVEPOINT company_sample_write_check");
  try {
    const command = { creationId: randomUUID(), attributeDefinitionName: "검증용 메모", attributeType: "Text" };
    const column = await createColumn.execute(user, plan.workspaceId, plan.ids.companyView, command);
    check(column.created && await tx.recordAttributeValueDefinition.count({ where: { attributeDefinitionId: column.attributeDefinitionId } }) === 6, "COLUMN_MATERIALIZATION_FAILED");
    check(!(await createColumn.execute(user, plan.workspaceId, plan.ids.companyView, command)).created, "COLUMN_RETRY_FAILED");
    await renameColumn.execute(user, plan.workspaceId, plan.ids.companyView, column.viewAttributeSettingDefinitionId, { labelOverride: "상담 요약" });
    await updateAttribute.execute(user, plan.workspaceId, plan.ids.company, column.attributeDefinitionId, { hasTitle: true, title: "업무 메모", hasDescription: false, hasIcon: false, hasIsMultiselect: false });
    const renamed = await tx.attributeDefinition.findUniqueOrThrow({ where: { id: column.attributeDefinitionId } });
    const label = await tx.viewAttributeSettingDefinition.findUniqueOrThrow({ where: { id: column.viewAttributeSettingDefinitionId } });
    check(renamed.title === "업무 메모" && label.labelOverride === "상담 요약", "SOURCE_TITLE_AND_VIEW_LABEL_NOT_SEPARATE");
    const attrs = plan.after.AttributeDefinition.filter(a => a.objectDefinitionId === plan.ids.company);
    const attr = slug => attrs.find(a => a.apiSlug === slug).id;
    const input = { creationId: randomUUID(), values: [
      { attributeDefinitionId: attr("name"), values: ["검증용 회사"] },
      { attributeDefinitionId: attr("employee_count"), values: ["42"] },
      { attributeDefinitionId: attr("important"), values: [false] },
      { attributeDefinitionId: attr("registered_on"), values: ["2026-11-13"] },
      { attributeDefinitionId: attr("contact_email"), values: ["test@company.example"] },
      { attributeDefinitionId: column.attributeDefinitionId, values: ["초기 상담 기록"] },
    ] };
    await writes.create(user, plan.workspaceId, plan.ids.company, input);
    await writes.create(user, plan.workspaceId, plan.ids.company, input);
    check(await tx.recordDefinition.count({ where: { id: input.creationId } }) === 1, "RECORD_RETRY_DUPLICATED");
    const cell = await tx.recordAttributeValueDefinition.findFirstOrThrow({ where: { recordDefinitionId: input.creationId, attributeDefinitionId: column.attributeDefinitionId } });
    await writes.update(user, plan.workspaceId, plan.ids.company, input.creationId, cell.id, "상담 후 후속 연락 예약");
    const stored = await tx.recordAttributeValueDefinition.findUniqueOrThrow({ where: { id: cell.id } });
    check(stored.textValue === "상담 후 후속 연락 예약", "RECORD_UPDATE_NOT_STORED");
    await verifyReaders(tx, context, { ...plan, expectedCompanyCount: 7 });
    return { columnCreatedAndMaterialized: true, columnRetryReused: true, sourceAttributeRenamed: true, viewLabelSavedSeparately: true, recordCreatedWithTypedValues: true, recordRetryReused: true, recordValueUpdated: true, viewReadAfterWrite: true, validationRowsCommitted: 0 };
  } finally { await tx.$executeRawUnsafe("ROLLBACK TO SAVEPOINT company_sample_write_check"); }
}
// 기능 : 후속 실행은 백업한 동일 상태에서만 가능하며 리허설이 성공해야 적용합니다.
async function main() {
  const [mode = "plan", arg] = process.argv.slice(2);
  check(["plan", "rehearse", "apply", "verify"].includes(mode) && arg, "USAGE");
  const env = environment(); const db = new PrismaClient({ datasources: { db: { url: env.url } }, log: [] });
  const manager = new PrismaTransactionManager(db); let report;
  try {
    if (mode === "plan") {
      check(/^[a-f0-9-]{36}$/.test(arg), "WORKSPACE_UUID_REQUIRED");
      const plan = await manager.runInTransaction(async context => {
        const tx = resolvePrismaReadContext(context); await tx.$executeRawUnsafe("SET TRANSACTION ISOLATION LEVEL REPEATABLE READ, READ ONLY");
        const members = await tx.workspaceMember.findMany({ where: { workspaceId: arg, role: "OWNER" }, select: { id: true, userId: true } });
        check(members.length === 1, "EXPECTED_SAMPLE_OWNER");
        const actors = await tx.actor.findMany({ where: { workspaceId: arg, workspaceMemberId: members[0].id, type: "WORKSPACE_MEMBER" }, select: { id: true } }); check(actors.length === 1, "EXPECTED_MEMBER_ACTOR");
        const scope = { workspaceId: arg, userId: members[0].userId, memberId: members[0].id, actorId: actors[0].id };
        const before = await snapshot(tx, arg); return { ...scope, capturedAt: new Date().toISOString(), before, ...buildAfter(before, scope), environmentHashes: env.hashes, databaseIdentity: env.identity };
      }, { timeoutMs: 60000 });
      const folder = resolve(root, "TEMP", `company-sample-${new Date().toISOString().replaceAll(":", "-")}`); mkdirSync(folder, { recursive: true, mode: 0o700 });
      save(resolve(folder, "plan.json"), plan);
      report = { mode, folder, before: Object.fromEntries(models.map(m => [m, plan.before[m].length])), after: Object.fromEntries(models.map(m => [m, plan.after[m].length])), changes: Object.fromEntries(Object.entries(diff(plan.before, plan.after)).map(([m, c]) => [m, Object.fromEntries(Object.entries(c).map(([k, rows]) => [k, rows.length]))])) };
    } else {
      const folder = resolve(root, arg); const plan = JSON.parse(readFileSync(resolve(folder, "plan.json"), "utf8"));
      check(plan.databaseIdentity === env.identity && canonical(plan.environmentHashes) === canonical(env.hashes), "CONNECTION_OR_ENV_CHANGED");
      if (mode === "apply") { const rehearsal = JSON.parse(readFileSync(resolve(folder, "rehearsed.json"), "utf8")); check(rehearsal.planDigest === digest(plan), "REHEARSAL_REQUIRED"); }
      const marker = new Error("INTENDED_ROLLBACK");
      try {
        await manager.runInTransaction(async context => {
          const tx = resolvePrismaReadContext(context);
          await tx.$executeRawUnsafe("SET LOCAL lock_timeout = '5s'"); await tx.$executeRawUnsafe("SET LOCAL statement_timeout = '15000ms'");
          if (mode === "verify") await tx.$executeRawUnsafe("SET TRANSACTION ISOLATION LEVEL REPEATABLE READ, READ ONLY");
          else await tx.$executeRawUnsafe(`LOCK TABLE ${models.map(quote).sort().join(", ")} IN SHARE ROW EXCLUSIVE MODE`);
          const current = await snapshot(tx, plan.workspaceId);
          const alreadyApplied = canonical(current) === canonical(plan.after);
          check(alreadyApplied || mode !== "verify" && canonical(current) === canonical(plan.before), "WORKSPACE_CHANGED_SINCE_PLAN");
          const protectedBefore = await protectedDigest(tx, plan.workspaceId);
          if (!alreadyApplied) await applyDiff(tx, plan.before, plan.after);
          check(canonical(await snapshot(tx, plan.workspaceId)) === canonical(plan.after), "APPLIED_STATE_MISMATCH");
          const readers = await verifyReaders(db, context, plan);
          check(canonical(await protectedDigest(tx, plan.workspaceId)) === canonical(protectedBefore), "UNRELATED_DATA_CHANGED");
          check(canonical(environment().hashes) === canonical(env.hashes), "ENV_CHANGED");
          report = { mode, planDigest: digest(plan), readers, protectedDataUnchanged: true, alreadyApplied, folder };
          if (mode === "rehearse") {
            check(!alreadyApplied, "REHEARSAL_REQUIRES_BEFORE_STATE");
            report.writeChecks = await verifyWrites(context, plan);
            check(canonical(await snapshot(tx, plan.workspaceId)) === canonical(plan.after), "WRITE_CHECK_CLEANUP_FAILED");
            await applyDiff(tx, plan.after, plan.before);
            check(canonical(await snapshot(tx, plan.workspaceId)) === canonical(plan.before), "RESTORE_VALIDATION_FAILED");
            report.restoreValidated = true; throw marker;
          }
        }, { timeoutMs: 120000 });
      } catch (error) { if (error !== marker) throw error; }
      if (mode === "rehearse") {
        const current = await db.$transaction(tx => snapshot(tx, plan.workspaceId), { isolationLevel: "RepeatableRead", timeout: 30000 });
        check(canonical(current) === canonical(plan.before), "ROLLBACK_STATE_MISMATCH"); report.rollbackVerified = true; save(resolve(folder, "rehearsed.json"), report);
      } else save(resolve(folder, `${mode}-${Date.now()}.json`), report);
    }
    console.log(JSON.stringify(report, null, 2));
  } finally { await db.$disconnect(); }
}
await main().catch(error => { console.error(JSON.stringify({ result: "FAILED", code: error.safeCode || error.code || error.name })); process.exitCode = 1; });

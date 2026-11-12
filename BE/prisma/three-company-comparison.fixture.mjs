import { createHash } from "node:crypto";

// 기능 : Workspace별 비교 데이터 ID를 재실행해도 동일하게 생성합니다.
export function comparisonId(workspaceId, key) {
  const bytes = createHash("sha256").update(`${workspaceId}/three-company-comparison-v1/${key}`).digest().subarray(0, 16);
  bytes[6] = (bytes[6] & 15) | 80;
  bytes[8] = (bytes[8] & 63) | 128;
  const hex = bytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

// 기능 : 회사명·공식 도메인 외에는 가상인 관리항목과 파이프라인 비교 데이터를 구성합니다.
export function buildComparisonFixture({ workspaceId, actorId, memberId, objectOrder = 0, listOrder = 0, favoriteOrder = 0 }) {
  const rows = {};
  const id = (key) => comparisonId(workspaceId, key);
  // 기능 : 같은 Workspace와 Actor를 사용하는 삽입 행을 모델별로 모읍니다.
  const add = (model, key, fields) => {
    const row = { id: id(key), workspaceId, createdByActorId: actorId, updatedByActorId: actorId, ...fields };
    (rows[model] ??= []).push(row);
    return row.id;
  };
  const companyObject = add("ObjectDefinition", "object/companies", {
    apiSlug: "companies", singularName: "회사", pluralName: "회사", icon: "building-2",
    description: "OpenAI, SAMSUNG, SK HYNIX 비교군. 회사명과 공식 도메인 외 정보는 가상입니다.", sortOrder: objectOrder,
  });
  const salesObject = add("ObjectDefinition", "object/sales", {
    apiSlug: "sales", singularName: "영업", pluralName: "영업", icon: "briefcase-business",
    description: "세 회사에 연결된 가상 영업 기록입니다. 실제 거래·계약·매출을 의미하지 않습니다.", sortOrder: objectOrder + 1,
  });
  const pipeline = add("ListDefinition", "list/pipeline", {
    apiSlug: "sales-pipeline", name: "영업 파이프라인", icon: "kanban",
    description: "회사별 가상 영업 3건 중 2건씩 등록한 비교용 업무목록입니다. 진행 단계는 이 목록의 참여 항목에 저장합니다.", sortOrder: listOrder,
  });
  const attributes = {};
  // 기능 : 원본 Object 속성과 업무목록 전용 속성의 소속을 명시합니다.
  const attribute = (owner, key, title, type, order, extra = {}) => {
    const objectDefinitionId = owner === "company" ? companyObject : owner === "sales" ? salesObject : null;
    const aid = add("AttributeDefinition", `attribute/${owner}/${key}`, {
      objectDefinitionId, listDefinitionId: objectDefinitionId ? null : pipeline,
      apiSlug: key, title, type, sortOrder: order, isMultiselect: false,
      configJson: null, icon: null, description: "비교용 더미 속성. 필수값 정책을 임의로 추가하지 않습니다.", ...extra,
    });
    attributes[`${owner}.${key}`] = { id: aid, type, objectDefinitionId, listDefinitionId: objectDefinitionId ? null : pipeline };
    return aid;
  };
  attribute("company", "name", "회사명", "Text", 0);
  attribute("company", "domain", "공식 도메인", "Domain", 1);
  attribute("company", "category", "가상 고객 구분", "Select", 2);
  attribute("company", "owner", "담당 영업", "ActorReference", 3);
  attribute("company", "important", "중요", "Checkbox", 4);
  attribute("company", "registered_on", "가상 등록일", "Date", 5);
  attribute("company", "memo", "메모", "Text", 6);
  attribute("company", "sales", "연결 영업", "RecordReference", 7, {
    isMultiselect: true, configJson: { recordReference: { objectDefinitionId: salesObject } },
  });
  attribute("sales", "name", "영업명", "Text", 0);
  attribute("sales", "company", "대상 회사", "RecordReference", 1, {
    configJson: { recordReference: { objectDefinitionId: companyObject } },
  });
  attribute("sales", "amount", "가상 예상 금액", "Currency", 2, { configJson: { currency: { defaultCurrencyCode: "KRW" } } });
  attribute("sales", "close_on", "예상 계약일", "Date", 3);
  attribute("sales", "owner", "담당자", "ActorReference", 4);
  attribute("sales", "priority", "우선순위", "Select", 5);
  attribute("sales", "important", "중요", "Checkbox", 6);
  attribute("sales", "progress", "가상 진행률", "Number", 7);
  attribute("sales", "memo", "영업 메모", "Text", 8);
  attribute("pipeline", "stage", "진행 단계", "Status", 0);
  attribute("pipeline", "next_contact_on", "다음 연락일", "Date", 1);
  attribute("pipeline", "focus", "집중관리", "Checkbox", 2);
  attribute("pipeline", "reviewer", "검토 담당자", "ActorReference", 3);
  attribute("pipeline", "memo", "검토 메모", "Text", 4);

  const options = {};
  // 기능 : 선택지와 상태 옵션을 해당 속성의 ID에 연결합니다.
  const addOptions = (key, values, model) => values.forEach(([slug, title, color], index) => {
    options[`${key}.${slug}`] = add(model, `option/${key}/${slug}`, {
      attributeDefinitionId: attributes[key].id, title, color, sortOrder: index,
    });
  });
  addOptions("company.category", [["new", "신규", "blue"], ["existing", "기존", "green"], ["review", "검토", "purple"]], "SelectOption");
  addOptions("sales.priority", [["high", "높음", "orange"], ["normal", "보통", "blue"], ["low", "낮음", "gray"]], "SelectOption");
  addOptions("pipeline.stage", [["inquiry", "문의", "blue"], ["consultation", "상담", "purple"], ["proposal", "제안", "yellow"], ["negotiation", "협상", "orange"], ["won", "수주", "green"], ["hold", "보류", "gray"], ["lost", "실주", "red"]], "StatusOption");
  add("RelationshipDefinition", "relationship/company-sales", {
    sourceObjectDefinitionId: companyObject, sourceAttributeDefinitionId: attributes["company.sales"].id,
    targetObjectDefinitionId: salesObject, targetAttributeDefinitionId: attributes["sales.company"].id,
  });

  const companies = [
    { key: "openai", name: "OpenAI", domain: "openai.com", category: "new", important: true },
    { key: "samsung", name: "SAMSUNG", domain: "samsung.com", category: "existing", important: false },
    { key: "sk-hynix", name: "SK HYNIX", domain: "skhynix.com", category: "review", important: true },
  ];
  const sales = [
    { key: "openai-1", company: "openai", title: "OpenAI 업무 플랫폼 도입", amount: "12000000", close: "2026-11-20", priority: "normal", progress: "10", stage: "inquiry", next: "2026-11-16", focus: false },
    { key: "openai-2", company: "openai", title: "OpenAI 도입 범위 확장", amount: "48000000", close: "2026-12-04", priority: "high", progress: "50", stage: "proposal", next: "2026-11-18", focus: true },
    { key: "openai-3", company: "openai", title: "OpenAI 차기 분기 검토", amount: "8000000", close: "2027-01-15", priority: "low", progress: "0", stage: undefined, next: null, focus: false },
    { key: "samsung-1", company: "samsung", title: "SAMSUNG 무료 평가", amount: "0", close: "2026-11-27", priority: "normal", progress: "25", stage: "consultation", next: "2026-11-17", focus: false },
    { key: "samsung-2", company: "samsung", title: "SAMSUNG 운영 시스템 도입", amount: "75000000", close: "2026-12-11", priority: "high", progress: "80", stage: "negotiation", next: "2026-11-19", focus: true },
    { key: "samsung-3", company: "samsung", title: "SAMSUNG 교육 서비스 검토", amount: "3000000", close: "2027-01-22", priority: "low", progress: "0", stage: undefined, next: null, focus: false },
    { key: "sk-hynix-1", company: "sk-hynix", title: "SK HYNIX 플랫폼 계약", amount: "32000000", close: "2026-11-12", priority: "high", progress: "100", stage: "won", next: null, focus: false },
    { key: "sk-hynix-2", company: "sk-hynix", title: "SK HYNIX 초기 상담", amount: null, close: null, priority: "normal", progress: "0", stage: null, next: null, focus: false, unassigned: true },
    { key: "sk-hynix-3", company: "sk-hynix", title: "SK HYNIX 유지보수 검토", amount: "6000000", close: "2027-02-05", priority: "low", progress: "0", stage: undefined, next: null, focus: false },
  ];
  const records = {};
  for (const company of companies) records[company.key] = add("RecordDefinition", `record/company/${company.key}`, { objectDefinitionId: companyObject });
  for (const sale of sales) records[sale.key] = add("RecordDefinition", `record/sales/${sale.key}`, { objectDefinitionId: salesObject });

  // 기능 : 타입별 저장 컬럼과 nullable 참조를 명시하고 빈 셀도 하나의 값 행으로 생성합니다.
  const value = (ownerKey, attributeKey, raw, occurrence = 0, entryId = null) => {
    const a = attributes[attributeKey];
    const fields = { attributeDefinitionId: a.id, attributeType: a.type, jsonValue: null, textValue: null,
      numberValue: null, booleanValue: null, dateValue: null, timestampValue: null, selectOptionId: null,
      statusOptionId: null, targetRecordDefinitionId: null, targetObjectDefinitionId: null, targetActorId: null };
    if (raw !== null) {
      if (["Text", "Domain"].includes(a.type)) fields.textValue = raw;
      else if (["Number", "Currency"].includes(a.type)) fields.numberValue = raw;
      else if (a.type === "Checkbox") fields.booleanValue = raw;
      else if (a.type === "Date") fields.dateValue = `${raw}T00:00:00.000Z`;
      else if (a.type === "Select") fields.selectOptionId = options[`${attributeKey}.${raw}`];
      else if (a.type === "Status") fields.statusOptionId = options[`${attributeKey}.${raw}`];
      else if (a.type === "ActorReference") fields.targetActorId = raw;
      else if (a.type === "RecordReference") { fields.targetRecordDefinitionId = raw.recordId; fields.targetObjectDefinitionId = raw.objectId; }
      else throw new Error("COMPARISON_UNSUPPORTED_TYPE");
    }
    if (entryId) add("ListEntryValueDefinition", `entry-value/${ownerKey}/${attributeKey}/${occurrence}`, { ...fields, listDefinitionId: pipeline, listEntryDefinitionId: entryId });
    else add("RecordAttributeValueDefinition", `record-value/${ownerKey}/${attributeKey}/${occurrence}`, { ...fields, objectDefinitionId: a.objectDefinitionId, recordDefinitionId: records[ownerKey] });
  };
  for (const company of companies) {
    const fields = { name: company.name, domain: company.domain, category: company.category, owner: actorId,
      important: company.important, registered_on: "2026-11-12", memo: "회사명과 공식 도메인만 실제입니다. 고객 구분·영업·금액·단계는 가상 비교 데이터입니다." };
    for (const [key, raw] of Object.entries(fields)) value(company.key, `company.${key}`, raw);
    sales.filter(sale => sale.company === company.key).forEach((sale, index) => value(company.key, "company.sales", { recordId: records[sale.key], objectId: salesObject }, index));
  }
  for (const sale of sales) {
    const fields = { name: `[가상] ${sale.title}`, company: { recordId: records[sale.company], objectId: companyObject },
      amount: sale.amount, close_on: sale.close, owner: sale.unassigned ? null : actorId, priority: sale.priority,
      important: sale.focus, progress: sale.progress, memo: sale.unassigned ? null : "비교용 가상 영업입니다. 실제 회사의 거래 사실이 아닙니다." };
    for (const [key, raw] of Object.entries(fields)) value(sale.key, `sales.${key}`, raw);
    if (sale.stage !== undefined) {
      const entryId = add("ListEntryDefinition", `entry/${sale.key}`, { listDefinitionId: pipeline, recordDefinitionId: records[sale.key] });
      const fields = { stage: sale.stage, next_contact_on: sale.next, focus: sale.focus,
        reviewer: sale.unassigned ? null : actorId, memo: sale.unassigned ? null : `[가상] ${sale.title}의 파이프라인 검토 메모` };
      for (const [key, raw] of Object.entries(fields)) value(sale.key, `pipeline.${key}`, raw, 0, entryId);
    }
  }

  const companyView = add("ViewDefinition", "view/company-table", { objectDefinitionId: companyObject, listDefinitionId: null,
    name: "전체 회사", type: "TABLE", sortOrder: 0, icon: "table-2", description: "실제 회사 3곳을 사용하는 가상 비교군", configJson: { rowDensity: "COMFORTABLE" } });
  const salesView = add("ViewDefinition", "view/sales-list", { objectDefinitionId: salesObject, listDefinitionId: null,
    name: "전체 영업", type: "LIST", sortOrder: 0, icon: "list", description: "회사별 3건씩 총 9건의 가상 영업", configJson: { rowDensity: "COMFORTABLE" } });
  const pipelineView = add("ViewDefinition", "view/pipeline-kanban", { objectDefinitionId: null, listDefinitionId: pipeline,
    name: "진행 단계별", type: "KANBAN", sortOrder: 0, icon: "columns-3", description: "영업 9건 중 회사별 2건씩 총 6건을 등록한 파이프라인", configJson: { cardDensity: "COMFORTABLE", showEmptyGroups: true } });
  // 기능 : 표시 이름과 참조 경로를 원본 속성과 분리하여 View별 binding에 저장합니다.
  const bind = (viewId, key, order, role = "DISPLAY", extra = {}) => {
    const a = attributes[key];
    const formatJson = a.type === "Currency" ? { useGrouping: true, fractionDigits: 0 }
      : a.type === "Date" ? { dateFormat: "YYYY-MM-DD" }
      : key === "sales.progress" ? { style: "PERCENT", valueScale: 100, fractionDigits: 0 } : null;
    add("ViewAttributeSettingDefinition", `binding/${viewId}/${key}/${order}`, {
      viewDefinitionId: viewId, attributeDefinitionId: a.id, sourceScope: a.listDefinitionId ? "LIST_ENTRY" : "RECORD",
      referenceAttributeIdPathJson: [], attributeDisplayRole: role, sortOrder: order, labelOverride: null,
      width: role === "TITLE" ? 300 : 180, isHidden: false, formatJson, ...extra,
    });
  };
  Object.keys(attributes).filter(key => key.startsWith("company.")).forEach((key, index) => bind(companyView, key, index, index === 0 ? "TITLE" : "DISPLAY"));
  Object.keys(attributes).filter(key => key.startsWith("sales.")).forEach((key, index) => bind(salesView, key, index, index === 0 ? "TITLE" : key === "sales.memo" ? "BODY" : "DISPLAY"));
  bind(pipelineView, "sales.name", 0, "TITLE");
  bind(pipelineView, "sales.company", 1);
  bind(pipelineView, "sales.amount", 2, "DISPLAY", { labelOverride: "예상 금액" });
  bind(pipelineView, "company.domain", 3, "DISPLAY", { referenceAttributeIdPathJson: [attributes["sales.company"].id], labelOverride: "회사 도메인" });
  bind(pipelineView, "pipeline.next_contact_on", 4);
  bind(pipelineView, "pipeline.focus", 5);
  bind(pipelineView, "pipeline.reviewer", 6);
  bind(pipelineView, "pipeline.memo", 7);
  for (const [viewId, key] of [[companyView, "company.name"], [salesView, "sales.close_on"], [pipelineView, "pipeline.next_contact_on"]]) {
    const a = attributes[key];
    add("ViewSortDefinition", `sort/${viewId}`, { viewDefinitionId: viewId, sourceScope: a.listDefinitionId ? "LIST_ENTRY" : "RECORD",
      attributeDefinitionId: a.id, referenceAttributeIdPathJson: [], sortDirection: "ASC", sortOrder: 0, configJson: { nulls: "LAST" } });
  }
  const groupId = add("ViewGroupDefinition", "group/pipeline-stage", { viewDefinitionId: pipelineView,
    sourceScope: "LIST_ENTRY", attributeDefinitionId: attributes["pipeline.stage"].id, referenceAttributeIdPathJson: [],
    groupRole: "GROUP", sortDirection: "ASC", sortOrder: 0, configJson: null });
  const stageKeys = ["inquiry", "consultation", "proposal", "negotiation", "won", "hold", "lost", null];
  stageKeys.forEach((key, index) => add("ViewGroupSettingDefinition", `group-setting/${key ?? "unassigned"}`, {
    viewDefinitionId: pipelineView, viewGroupDefinitionId: groupId, attributeDefinitionId: attributes["pipeline.stage"].id,
    statusOptionId: key ? options[`pipeline.stage.${key}`] : null, selectOptionId: null,
    groupKeyJson: key ? null : { value: null }, sortOrder: index, labelOverride: key ? null : "미지정",
    isHidden: false, isFold: false, configJson: null,
  }));
  [companyView, salesView, pipelineView].forEach((viewId, index) => add("ViewFavoriteDefinition", `favorite/${viewId}`, {
    workspaceMemberId: memberId, viewDefinitionId: viewId, sortOrder: favoriteOrder + index,
  }));
  return { rows, ids: { companyObject, salesObject, pipeline, companyView, salesView, pipelineView }, attributes,
    companies, sales, expected: { companies: 3, sales: 9, entries: 6, views: 3, companyReferences: 18,
      stages: { 문의: 1, 상담: 1, 제안: 1, 협상: 1, 수주: 1, 보류: 0, 실주: 0, 미지정: 1 } } };
}

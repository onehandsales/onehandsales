import { EncryptedViewDataTokenCodec } from "../../infrastructure/view-data-token-codec";
import { ViewDataQueryContext } from "./view-data-query-context";
import { readViewData } from "./view-data-readers";
import { fixtureId, fixtureUser, viewDataFixture } from "./view-data.fixture";
import { ViewDataConfigurationError, ViewDataNeedsConfiguration } from "./view-data.errors";
import { valueKey } from "./view-data-json";
import { resolveViewSource } from "./view-data-loader";
import type { ViewDataSnapshot } from "./view-data-loader";
import type { ViewDataRequest } from "./view-data.types";

const codec = new EncryptedViewDataTokenCodec("unit-test-key");
// 기능 : 독립 fixture의 공통 실행 경로를 호출합니다.
function execute(snapshot: ViewDataSnapshot, request: ViewDataRequest = {}) {
  return readViewData(new ViewDataQueryContext(snapshot, request, fixtureUser, codec));
}
// 기능 : 숫자 필터를 저장 설정으로 추가합니다.
function numericFilter(snapshot: ViewDataSnapshot, operator = "gte", input = "0.2", mode: "ANY" | "ALL" = "ANY") {
  const row = snapshot.configuration.viewAttributeSettingDefinitions[1]!;
  snapshot.configuration.viewFilterGroupDefinitions.push({ ...row, parentViewFilterGroupDefinitionId: null, conditionGroupOperator: "AND" });
  snapshot.configuration.viewFilterConditionDefinitions.push({ ...row, viewFilterGroupDefinitionId: row.id,
    comparisonOperator: operator, comparisonValueJson: { value: input }, multiValueMatchMode: mode });
}
describe("Three-type View execution", () => {
  it.each(["TABLE", "KANBAN", "LIST"] as const)("keeps duplicate Record entries for %s", type => {
    const result = execute(viewDataFixture(type));
    expect(result).toMatchObject({ state: "READY", viewType: type, part: "MAIN", summary: { sourceItemCount: 3, matchedItemCount: 3 } });
    if (result.state === "READY" && result.part === "MAIN") {
      const items = result.viewType === "KANBAN" ? result.data.columns.flatMap(column => column.items) : result.data.items;
      expect(new Set(items.map(item => item.itemKey)).size).toBe(3);
      expect(new Set(items.map(item => item.recordDefinitionId)).size).toBe(2);
    }
  });
  it("uses Record grain only for an Object source", () => {
    const s = viewDataFixture("TABLE");
    s.source = { kind: "OBJECT", objectDefinitionId: fixtureId(5), listDefinitionId: null, itemKind: "RECORD" };
    s.configuration.view = { ...s.configuration.view, objectDefinitionId: fixtureId(5), listDefinitionId: null };
    s.items = [...s.records.values()].map(record => ({ key: "RECORD:" + record.id, record, entry: null, createdAt: record.createdAt }));
    expect(execute(s).summary?.sourceItemCount).toBe(2);
  });
  it("filters the entire source before limiting the final result", () => {
    const s = viewDataFixture("TABLE"); numericFilter(s);
    const result = execute(s, { limit: 1 });
    expect(result.summary).toEqual({ sourceItemCount: 3, matchedItemCount: 1, eligibleItemCount: 1 });
    if (result.state === "READY" && result.part === "MAIN" && result.viewType === "TABLE")
      expect(result.data.items[0]?.title).toBe("Record 2");
  });
  it("sorts Decimal values precisely before paging and keeps DESC nulls last", () => {
    const s = viewDataFixture("TABLE"); const row = s.configuration.viewAttributeSettingDefinitions[1]!;
    s.configuration.viewSortDefinitions.push({ ...row, sortDirection: "DESC", configJson: { nulls: "LAST" } });
    s.values.get(valueKey("RECORD", fixtureId(70), fixtureId(11)))![0] = {
      ...s.values.get(valueKey("RECORD", fixtureId(70), fixtureId(11)))![0]!, numberValue: "9007199254740992.0000000001" };
    s.values.get(valueKey("RECORD", fixtureId(71), fixtureId(11)))![0] = {
      ...s.values.get(valueKey("RECORD", fixtureId(71), fixtureId(11)))![0]!, numberValue: "9007199254740992.0000000002" };
    const result = execute(s, { limit: 1 });
    if (result.state === "READY" && result.part === "MAIN" && result.viewType === "TABLE")
      expect(result.data.items[0]?.recordDefinitionId).toBe(fixtureId(71));
    s.values.set(valueKey("RECORD", fixtureId(71), fixtureId(11)), []);
    const context = new ViewDataQueryContext(s, {}, fixtureUser, codec);
    expect(context.items.at(-1)?.record.id).toBe(fixtureId(71));
  });
  it.each(["ANY", "ALL"] as const)("evaluates multivalue %s without overwriting rows", mode => {
    const s = viewDataFixture("TABLE"); numericFilter(s, "gte", "0.2", mode);
    const attribute = s.attributes.get(fixtureId(11))!; s.attributes.set(attribute.id, { ...attribute, isMultiselect: true });
    const rows = s.values.get(valueKey("RECORD", fixtureId(70), attribute.id))!;
    rows.push({ ...rows[0]!, id: fixtureId(900), numberValue: "0.3" });
    const result = execute(s);
    expect(result.summary?.matchedItemCount).toBe(mode === "ANY" ? 3 : 1);
    if (mode === "ANY" && result.state === "READY" && result.part === "MAIN" && result.viewType === "TABLE")
      expect(result.data.items[0]?.cells.find(cell => cell.bindingId === fixtureId(41))?.values).toHaveLength(2);
  });
  it("uses labels for options and preserves zero/false/null distinctions", () => {
    const s = viewDataFixture("TABLE"); const row = s.configuration.viewAttributeSettingDefinitions[1]!;
    s.configuration.viewAttributeSettingDefinitions.push({ ...row, id: fixtureId(901), attributeDefinitionId: fixtureId(12) });
    s.values.get(valueKey("RECORD", fixtureId(70), fixtureId(11)))![0] = { ...s.values.get(valueKey("RECORD", fixtureId(70), fixtureId(11)))![0]!, numberValue: "0" };
    const result = execute(s);
    if (result.state === "READY" && result.part === "MAIN" && result.viewType === "TABLE") {
      expect(result.data.items[0]?.cells.find(cell => cell.bindingId === fixtureId(41))?.values[0]?.value).toBe("0");
      expect(result.data.items[0]?.cells.find(cell => cell.bindingId === fixtureId(901))?.values[0]?.value).toMatchObject({ label: "Stage 1" });
    }
  });
  it("preserves JSON-only saved status and detects typed/JSON disagreement", () => {
    const s = viewDataFixture("KANBAN");
    const rows = s.values.get(valueKey("RECORD", fixtureId(70), fixtureId(12)))!;
    rows[0] = { ...rows[0]!, statusOptionId: null, jsonValue: { statusOptionId: fixtureId(30) } };
    expect(execute(s).state).toBe("READY");
    rows[0] = { ...rows[0]!, statusOptionId: fixtureId(31) };
    expect(() => execute(s)).toThrow(ViewDataConfigurationError);
  });
  it("omits hidden cells and does not select a hidden title", () => {
    const s = viewDataFixture("TABLE");
    s.configuration.viewAttributeSettingDefinitions.forEach((row, index, rows) => rows[index] = { ...row, isHidden: true });
    const result = execute(s);
    if (result.state === "READY" && result.part === "MAIN" && result.viewType === "TABLE") {
      expect(result.data.columnBindingIds).toEqual([]);
      expect(result.data.items[0]).toMatchObject({ title: "이름 없는 기록", cells: [] });
    }
  });
  it("searches every source item by visible text but not numeric serialization", () => {
    const s = viewDataFixture("TABLE");
    expect(execute(s, { q: "record 2", limit: 1 }).summary?.matchedItemCount).toBe(1);
    expect(execute(s, { q: "0.1" }).summary?.matchedItemCount).toBe(0);
  });
  it("keeps unconfigured presentation values null", () => {
    const result = execute(viewDataFixture("LIST"));
    if (result.state === "READY" && result.part === "MAIN" && result.viewType === "LIST")
      expect(result.data.presentation).toEqual({ rowDensity: null });
  });
  it.each(["TABLE", "KANBAN", "LIST"] as const)("keeps saved numeric grouping hints and exact values in %s", type => {
    for (const useGrouping of [true, false]) {
      const snapshot = viewDataFixture(type);
      const binding = snapshot.configuration.viewAttributeSettingDefinitions[1]!;
      snapshot.configuration.viewAttributeSettingDefinitions[1] = { ...binding, formatJson: { fractionDigits: 2, useGrouping } };
      const values = snapshot.values.get(valueKey("RECORD", fixtureId(70), binding.attributeDefinitionId))!;
      values[0] = { ...values[0]!, numberValue: "9007199254740992.0000000002" };
      const result = execute(snapshot);
      expect(result.state).toBe("READY");
      expect(result.bindings.find(row => row.id === binding.id)?.format).toEqual({ fractionDigits: 2, useGrouping });
      if (result.state !== "READY" || result.part !== "MAIN") throw Error("MAIN expected");
      const items = result.viewType === "KANBAN" ? result.data.columns.flatMap(column => column.items) : result.data.items;
      expect(items.flatMap(item => item.cells).filter(cell => cell.bindingId === binding.id).flatMap(cell => cell.values).map(value => value.value)).toContain("9007199254740992.0000000002");
    }
  });
  it.each(["true", 1, null, {}, []])("rejects non-boolean numeric grouping hint %p", useGrouping => {
    const snapshot = viewDataFixture("TABLE");
    const binding = snapshot.configuration.viewAttributeSettingDefinitions[1]!;
    snapshot.configuration.viewAttributeSettingDefinitions[1] = { ...binding, formatJson: { useGrouping } };
    expect(() => execute(snapshot)).toThrow(ViewDataNeedsConfiguration);
  });
  it("rejects a broken filter tree and unsupported operator even on empty sources", () => {
    const s = viewDataFixture("TABLE"); numericFilter(s); s.items = [];
    s.configuration.viewFilterGroupDefinitions[0] = { ...s.configuration.viewFilterGroupDefinitions[0]!, parentViewFilterGroupDefinitionId: fixtureId(41) };
    expect(() => execute(s)).toThrow(ViewDataConfigurationError);
    s.configuration.viewFilterGroupDefinitions[0] = { ...s.configuration.viewFilterGroupDefinitions[0]!, parentViewFilterGroupDefinitionId: null };
    s.configuration.viewFilterConditionDefinitions[0] = { ...s.configuration.viewFilterConditionDefinitions[0]!, comparisonOperator: "was" };
    expect(() => execute(s)).toThrow(ViewDataNeedsConfiguration);
  });
  it("treats an empty group as neutral and evaluates nested OR under AND", () => {
    const s = viewDataFixture("TABLE"); numericFilter(s);
    const group = s.configuration.viewFilterGroupDefinitions[0]!;
    s.configuration.viewFilterGroupDefinitions.push({ ...group, id: fixtureId(902), conditionGroupOperator: "OR", parentViewFilterGroupDefinitionId: group.id });
    expect(execute(s).summary?.matchedItemCount).toBe(1);
    s.configuration.viewFilterConditionDefinitions.push({ ...s.configuration.viewFilterConditionDefinitions[0]!,
      id: fixtureId(903), viewFilterGroupDefinitionId: fixtureId(902), comparisonOperator: "lt", comparisonValueJson: { value: "0.2" } });
    expect(execute(s).summary?.matchedItemCount).toBe(0);
  });
  it("keeps independent column cursors, including a folded column", () => {
    const s = viewDataFixture("KANBAN");
    const first = execute(s, { limit: 1 });
    if (first.state !== "READY" || first.part !== "MAIN" || first.viewType !== "KANBAN") throw Error("KANBAN expected");
    const column = first.data.columns[0]!;
    expect(column.count).toBe(2); expect(column.items).toHaveLength(1);
    const next = execute(s, { part: "GROUP_ITEMS", limit: 1, groupToken: column.groupToken, cursor: column.pageInfo.nextCursor! });
    if (next.state !== "READY" || next.part !== "GROUP_ITEMS") throw Error("GROUP_ITEMS expected");
    expect(next.data.items[0]?.itemKey).not.toBe(column.items[0]?.itemKey);
    expect(() => execute(s, { part: "GROUP_ITEMS", groupToken: first.data.columns[1]!.groupToken, cursor: column.pageInfo.nextCursor! })).toThrow("Cursor does not match");
    const group = s.configuration.viewGroupDefinitions[0]!;
    s.configuration.viewGroupSettingDefinitions.push({ ...group, id: fixtureId(904), viewGroupDefinitionId: group.id,
      statusOptionId: fixtureId(30), selectOptionId: null, groupKeyJson: null, labelOverride: "Folded", isHidden: false, isFold: true });
    const folded = execute(s);
    if (folded.state !== "READY" || folded.part !== "MAIN" || folded.viewType !== "KANBAN") throw Error("KANBAN expected");
    const target = folded.data.columns.find(value => value.label === "Folded")!;
    expect(target).toMatchObject({ count: 2, isFold: true, items: [] });
    const expanded = execute(s, { part: "GROUP_ITEMS", groupToken: target.groupToken });
    if (expanded.state === "READY" && expanded.part === "GROUP_ITEMS") expect(expanded.data.items).toHaveLength(2);
  });
  it("retains hidden column metadata while excluding its items", () => {
    const s = viewDataFixture("KANBAN"); const group = s.configuration.viewGroupDefinitions[0]!;
    s.configuration.viewGroupSettingDefinitions.push({ ...group, id: fixtureId(905), viewGroupDefinitionId: group.id,
      statusOptionId: fixtureId(30), selectOptionId: null, groupKeyJson: null, labelOverride: null, isHidden: true, isFold: false });
    const result = execute(s);
    if (result.state === "READY" && result.part === "MAIN" && result.viewType === "KANBAN") {
      const hidden = result.data.columns.find(column => column.isHidden)!;
      expect(hidden).toMatchObject({ count: 2, items: [] });
      expect(() => execute(s, { part: "GROUP_ITEMS", groupToken: hidden.groupToken })).toThrow(ViewDataNeedsConfiguration);
    }
  });
  it("uses one stable cursor anchor across insertion before the previous page", () => {
    const s = viewDataFixture("TABLE");
    const first = execute(s, { limit: 1 });
    if (first.state !== "READY" || first.part !== "MAIN" || first.viewType !== "TABLE") throw Error("TABLE expected");
    const originalSecond = s.items[1]!.key;
    const template = s.items[0]!;
    const entry = { ...template.entry!, id: fixtureId(7), createdAt: "2026-01-01T00:00:00Z" };
    s.items.unshift({ ...template, key: "LIST_ENTRY:" + entry.id, entry, createdAt: entry.createdAt });
    const next = execute(s, { limit: 1, cursor: first.data.pageInfo.nextCursor! });
    if (next.state === "READY" && next.part === "MAIN" && next.viewType === "TABLE")
      expect(next.data.items[0]?.itemKey).toBe(originalSecond);
  });
  it("rejects cursor reuse after changing owner or stored configuration", () => {
    const s = viewDataFixture("LIST");
    const first = new ViewDataQueryContext(s, { limit: 1 }, fixtureUser, codec);
    const cursor = first.page(first.items).pageInfo.nextCursor!;
    const other = new ViewDataQueryContext(s, { cursor }, { ...fixtureUser, id: fixtureId(999) }, codec);
    expect(() => other.page(other.items)).toThrow("Cursor does not match");
    s.configuration.view = { ...s.configuration.view, name: "Changed" };
    const stale = new ViewDataQueryContext(s, { cursor }, fixtureUser, codec);
    expect(() => stale.page(stale.items)).toThrow("View configuration changed");
  });
  it("requires an explicit source only for a View with both source FKs", () => {
    const view = { ...viewDataFixture("TABLE").configuration.view, objectDefinitionId: fixtureId(5) };
    expect(() => resolveViewSource(view, {})).toThrow("sourceType is required");
    expect(resolveViewSource(view, { sourceType: "LIST" }).itemKind).toBe("LIST_ENTRY");
  });
  it.each(["CALENDAR", "GANTT", "CHART", "PIVOT", "MAP", "DASHBOARD", "GALLERY", "TIMELINE"] as const)("explicitly defers %s", type => {
    const s = viewDataFixture("TABLE"); s.configuration.view = { ...s.configuration.view, type };
    expect(() => execute(s)).toThrow("This View type is not supported");
  });
  it("rejects ambiguous multivalue sorting and multiple TITLE roles", () => {
    const s = viewDataFixture("TABLE"); const row = s.configuration.viewAttributeSettingDefinitions[1]!;
    s.attributes.set(row.attributeDefinitionId, { ...s.attributes.get(row.attributeDefinitionId)!, isMultiselect: true });
    s.configuration.viewSortDefinitions.push({ ...row, sortDirection: "ASC", configJson: null });
    expect(() => execute(s)).toThrow(ViewDataNeedsConfiguration);
    s.configuration.viewSortDefinitions = [];
    s.configuration.viewAttributeSettingDefinitions.push({ ...row, attributeDisplayRole: "TITLE" });
    expect(() => execute(s)).toThrow(ViewDataNeedsConfiguration);
  });
  it("protects encrypted tokens against tampering and expiry", () => {
    let now = 0; const tokens = new EncryptedViewDataTokenCodec("token-test", () => now);
    const token = tokens.encode({ context: "query", configuration: "settings", part: "MAIN", anchor: "item", groupKey: null });
    expect(tokens.decode(token).anchor).toBe("item");
    expect(() => tokens.decode("x" + token)).toThrow("Invalid or expired");
    now = 31 * 60_000;
    expect(() => tokens.decode(token)).toThrow("Invalid or expired");
  });
  it("compares timezone-qualified timestamps as instants and rejects local-only times", () => {
    const s = viewDataFixture("TABLE");
    s.attributes.set(fixtureId(11), { ...s.attributes.get(fixtureId(11))!, type: "Timestamp" });
    for (const [index, id] of [fixtureId(70), fixtureId(71)].entries()) {
      const rows = s.values.get(valueKey("RECORD", id, fixtureId(11)))!;
      rows[0] = { ...rows[0]!, attributeType: "Timestamp", numberValue: null,
        timestampValue: index === 0 ? "2026-11-01T00:30:00+09:00" : "2026-10-31T17:00:00Z" };
    }
    numericFilter(s, "gte", "2026-10-31T16:00:00Z");
    expect(execute(s).summary?.matchedItemCount).toBe(1);
    s.configuration.viewFilterConditionDefinitions[0] = { ...s.configuration.viewFilterConditionDefinitions[0]!, comparisonValueJson: { value: "2026-10-31T16:00:00" } };
    expect(() => execute(s)).toThrow(ViewDataConfigurationError);
  });
  it("does not leak an unavailable reference identifier in a display-only cell", () => {
    const s = viewDataFixture("TABLE");
    s.attributes.set(fixtureId(11), { ...s.attributes.get(fixtureId(11))!, type: "ActorReference" });
    const rows = s.values.get(valueKey("RECORD", fixtureId(70), fixtureId(11)))!;
    rows[0] = { ...rows[0]!, attributeType: "ActorReference", numberValue: null, targetActorId: fixtureId(999) };
    const result = execute(s);
    if (result.state === "READY" && result.part === "MAIN" && result.viewType === "TABLE") {
      const cell = result.data.items[0]?.cells.find(value => value.bindingId === fixtureId(41));
      expect(cell).toMatchObject({ state: "UNAVAILABLE", values: [] });
      expect(JSON.stringify(result)).not.toContain(fixtureId(999));
    }
  });
  it.each(["TABLE", "LIST"] as const)("preserves multivalue option groups and occurrence identity for %s", type => {
    const s = viewDataFixture(type);
    const group = viewDataFixture("KANBAN").configuration.viewGroupDefinitions[0]!;
    s.configuration.viewGroupDefinitions.push(group);
    s.attributes.set(group.attributeDefinitionId, { ...s.attributes.get(group.attributeDefinitionId)!, isMultiselect: true });
    const rows = s.values.get(valueKey("RECORD", fixtureId(70), group.attributeDefinitionId))!;
    rows.push({ ...rows[0]!, id: fixtureId(906), statusOptionId: fixtureId(31) });
    const result = execute(s);
    if (result.state !== "READY" || result.part !== "MAIN" || result.viewType === "KANBAN") throw Error("row View expected");
    expect(result.data.groups.map(value => value.count)).toEqual([2, 3]);
    expect(result.data.items).toHaveLength(5);
    expect(new Set(result.data.items.map(item => item.occurrenceKey)).size).toBe(5);
    expect(result.summary?.eligibleItemCount).toBe(3);
  });
  it("applies an explicit null group key to the unassigned Kanban column", () => {
    const s = viewDataFixture("KANBAN"); const group = s.configuration.viewGroupDefinitions[0]!;
    s.values.set(valueKey("RECORD", fixtureId(70), group.attributeDefinitionId), []);
    s.configuration.viewGroupSettingDefinitions.push({ ...group, id: fixtureId(907), viewGroupDefinitionId: group.id,
      statusOptionId: null, selectOptionId: null, groupKeyJson: { value: null }, labelOverride: "Unassigned", isHidden: false, isFold: false });
    const result = execute(s);
    if (result.state !== "READY" || result.part !== "MAIN" || result.viewType !== "KANBAN") throw Error("KANBAN expected");
    expect(result.data.columns.find(column => column.label === "Unassigned")).toMatchObject({ count: 2 });
    expect(result.data.unassignedCount).toBe(2);
  });
  it("keeps false as a nonempty value and resolves an available actor label", () => {
    const s = viewDataFixture("TABLE");
    s.attributes.set(fixtureId(11), { ...s.attributes.get(fixtureId(11))!, type: "Checkbox" });
    const rows = s.values.get(valueKey("RECORD", fixtureId(70), fixtureId(11)))!;
    rows[0] = { ...rows[0]!, attributeType: "Checkbox", numberValue: null, booleanValue: false };
    const otherRows = s.values.get(valueKey("RECORD", fixtureId(71), fixtureId(11)))!;
    otherRows[0] = { ...otherRows[0]!, attributeType: "Checkbox", numberValue: null, booleanValue: true };
    numericFilter(s, "eq");
    s.configuration.viewFilterConditionDefinitions[0] = { ...s.configuration.viewFilterConditionDefinitions[0]!, comparisonValueJson: { value: false } };
    expect(execute(s).summary?.matchedItemCount).toBe(2);
    s.configuration.viewFilterConditionDefinitions.splice(0);
    s.attributes.set(fixtureId(11), { ...s.attributes.get(fixtureId(11))!, type: "ActorReference" });
    rows[0] = { ...rows[0]!, attributeType: "ActorReference", booleanValue: null, targetActorId: fixtureId(908) };
    s.actors.set(fixtureId(908), "Assignee");
    const result = execute(s);
    if (result.state === "READY" && result.part === "MAIN" && result.viewType === "TABLE")
      expect(result.data.items[0]?.cells.find(cell => cell.bindingId === fixtureId(41))?.values[0]?.value).toEqual({ actorId: fixtureId(908), label: "Assignee" });
  });
  it("rejects unsupported saved format, sort and group settings even with no source items", () => {
    const s = viewDataFixture("TABLE"); s.items = [];
    const binding = s.configuration.viewAttributeSettingDefinitions[1]!;
    s.configuration.viewAttributeSettingDefinitions[1] = { ...binding, formatJson: { arbitrary: true } };
    expect(() => execute(s)).toThrow(ViewDataNeedsConfiguration);
    s.configuration.viewAttributeSettingDefinitions[1] = binding;
    s.configuration.viewSortDefinitions.push({ ...binding, sortDirection: "ASC", configJson: [] });
    expect(() => execute(s)).toThrow(ViewDataNeedsConfiguration);
    s.configuration.viewSortDefinitions = [];
    const group = viewDataFixture("KANBAN").configuration.viewGroupDefinitions[0]!;
    s.configuration.viewGroupDefinitions.push(group);
    s.configuration.viewGroupSettingDefinitions.push({ ...group, id: fixtureId(909), viewGroupDefinitionId: group.id,
      statusOptionId: fixtureId(30), selectOptionId: null, groupKeyJson: null, labelOverride: null, isHidden: false, isFold: false, configJson: { aggregation: "SUM" } });
    expect(() => execute(s)).toThrow(ViewDataNeedsConfiguration);
  });
  it.each(["Date", "Location", "Interaction"] as const)("treats an all-empty %s value as empty for saved filters", type => {
    const s = viewDataFixture("TABLE");
    s.attributes.set(fixtureId(11), { ...s.attributes.get(fixtureId(11))!, type });
    for (const id of [fixtureId(70), fixtureId(71)]) {
      const rows = s.values.get(valueKey("RECORD", id, fixtureId(11)))!;
      rows[0] = { ...rows[0]!, attributeType: type, numberValue: null, textValue: null, jsonValue: type === "Date" ? { value: "" } : {} };
    }
    numericFilter(s, "is_empty");
    const result = execute(s);
    expect(result.summary?.matchedItemCount).toBe(3);
    if (result.state === "READY" && result.part === "MAIN" && result.viewType === "TABLE")
      expect(result.data.items[0]?.cells.find(cell => cell.bindingId === fixtureId(41))).toMatchObject({ state: "EMPTY" });
  });
  it("matches a Decimal group setting by numeric value rather than string scale", () => {
    const s = viewDataFixture("TABLE"); const binding = s.configuration.viewAttributeSettingDefinitions[1]!;
    const group = { ...binding, groupRole: "GROUP" as const, sortDirection: "ASC" as const, configJson: null };
    s.configuration.viewGroupDefinitions.push(group);
    s.configuration.viewGroupSettingDefinitions.push({ ...group, id: fixtureId(910), viewGroupDefinitionId: group.id,
      statusOptionId: null, selectOptionId: null, groupKeyJson: { value: "0.100" }, labelOverride: "Low", isHidden: false, isFold: false });
    const result = execute(s);
    if (result.state !== "READY" || result.part !== "MAIN" || result.viewType !== "TABLE") throw Error("TABLE expected");
    expect(result.data.groups.find(value => value.label === "Low")?.count).toBe(2);
  });
});

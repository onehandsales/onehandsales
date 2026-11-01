import { ViewDataLoader } from "./view-data-loader";
import { ViewDataQueryContext } from "./view-data-query-context";
import { readViewData } from "./view-data-readers";
import { fixtureId, fixtureUser, viewDataFixture } from "./view-data.fixture";
import { EncryptedViewDataTokenCodec } from "../../infrastructure/view-data-token-codec";
import { valueKey } from "./view-data-json";
import { ViewDataConfigurationError } from "./view-data.errors";
import type { ViewDataSnapshot } from "./view-data-loader";
import type { TransactionContext } from "@/shared/application/ports/transaction-manager.port";
import type { AttributeValueSnapshot } from "@/modules/attribute-definition/application/attribute-value-snapshot";

const transaction: TransactionContext = { transactionId: Symbol("shared-read") };
// 기능 : 소유 모듈의 공개 Port를 통과하는 실제 loader용 읽기 fixture를 구성합니다.
function setup(snapshot: ViewDataSnapshot) {
  const workspace = { hasMembership: jest.fn(), actors: jest.fn(async (_workspace: string, ids: string[]) =>
    ids.filter(id => snapshot.actors.has(id)).map(id => ({ id, label: snapshot.actors.get(id) ?? null }))) };
  // 기능 : 요청 owner/속성에 해당하는 전체 값 배열을 모의 소유 저장소에서 반환합니다.
  const values = (kind: "RECORD" | "LIST_ENTRY", ids: string[], attributes: string[], take: number): AttributeValueSnapshot[] =>
    ids.flatMap(id => attributes.flatMap(attribute => snapshot.values.get(valueKey(kind, id, attribute)) ?? [])).slice(0, take);
  const records = {
    list: jest.fn(async () => [...new Map(snapshot.items.map(item => [item.record.id, item.record])).values()]),
    find: jest.fn(async (_workspace: string, ids: string[]) => ids.flatMap(id => snapshot.records.has(id) ? [snapshot.records.get(id)!] : [])),
    values: jest.fn(async (_workspace: string, ids: string[], attributes: string[], take: number) => values("RECORD", ids, attributes, take)),
  };
  const entries = {
    exists: jest.fn(async () => true),
    list: jest.fn(async () => snapshot.items.flatMap(item => item.entry ? [item.entry] : [])),
    values: jest.fn(async (_workspace: string, _list: string, ids: string[], attributes: string[], take: number) => values("LIST_ENTRY", ids, attributes, take)),
  };
  const objects = { findObjectDefinitionSummary: jest.fn(async () => ({ id: fixtureId(5), singularName: "Fixture", icon: null })) };
  const metadata = {
    findAttributes: jest.fn(async (_workspace: string, ids: string[]) => ids.flatMap(id => snapshot.attributes.has(id) ? [snapshot.attributes.get(id)!] : [])),
    findOptions: jest.fn(async () => ({ selectOptions: [], statusOptions: [...snapshot.options.values()] })),
  };
  const relationships = { find: jest.fn(async () => snapshot.relationships) };
  const views = { read: jest.fn(), titles: jest.fn(async () => snapshot.titles) };
  const loader = new ViewDataLoader(views, records, entries, objects, metadata, relationships, workspace);
  return { loader, records, entries, objects, metadata, relationships, workspace, views };
}
describe("View loader owning-module boundaries", () => {
  it("passes the same snapshot to all owners and preserves duplicate entries", async () => {
    const s = viewDataFixture("KANBAN"); const ports = setup(s);
    const loaded = await ports.loader.load(s.configuration, s.source, transaction);
    expect(loaded.items).toHaveLength(3);
    expect(loaded.records.size).toBe(2);
    expect(ports.entries.exists).toHaveBeenCalledWith(fixtureId(3), fixtureId(6), transaction);
    expect(ports.records.find.mock.calls[0]?.at(-1)).toBe(transaction);
    expect(ports.records.values.mock.calls[0]?.at(-1)).toBe(transaction);
    expect(ports.entries.values.mock.calls[0]?.at(-1)).toBe(transaction);
    expect(ports.metadata.findAttributes.mock.calls[0]?.at(-1)).toBe(transaction);
    expect(ports.metadata.findOptions.mock.calls[0]?.at(-1)).toBe(transaction);
    expect(ports.relationships.find.mock.calls[0]?.at(-1)).toBe(transaction);
  });
  it("combines RECORD and LIST_ENTRY values without replacing their owners", async () => {
    const s = viewDataFixture("LIST");
    const attribute = { ...s.attributes.get(fixtureId(11))!, id: fixtureId(300), type: "Text" as const, objectDefinitionId: null, listDefinitionId: fixtureId(6) };
    s.attributes.set(attribute.id, attribute);
    const binding = s.configuration.viewAttributeSettingDefinitions[1]!;
    s.configuration.viewAttributeSettingDefinitions.push({ ...binding, id: fixtureId(301), attributeDefinitionId: attribute.id, sourceScope: "LIST_ENTRY" });
    s.items.forEach((item, index) => s.values.set(valueKey("LIST_ENTRY", item.entry!.id, attribute.id), [{
      ...s.values.get(valueKey("RECORD", fixtureId(70), fixtureId(10)))![0]!,
      id: fixtureId(310 + index), ownerId: item.entry!.id, attributeDefinitionId: attribute.id, attributeType: "Text", textValue: "Work " + index,
    }]));
    const loaded = await setup(s).loader.load(s.configuration, s.source, transaction);
    const result = readViewData(new ViewDataQueryContext(loaded, {}, fixtureUser, new EncryptedViewDataTokenCodec("loader")));
    if (result.state !== "READY" || result.part !== "MAIN" || result.viewType !== "LIST") throw Error("LIST expected");
    expect(result.data.items[0]?.cells.find(cell => cell.bindingId === fixtureId(301))?.values[0]?.sourceEntity.kind).toBe("LIST_ENTRY");
    expect(result.data.items[0]?.cells.find(cell => cell.bindingId === fixtureId(40))?.values[0]?.sourceEntity.kind).toBe("RECORD");
    expect(result.data.items.map(item => item.cells.find(cell => cell.bindingId === fixtureId(301))?.values[0]?.value)).toEqual(["Work 0", "Work 1", "Work 2"]);
  });
  it("traverses a declared reference path and restores a referenced record label", async () => {
    const s = viewDataFixture("TABLE");
    const reference = { ...s.attributes.get(fixtureId(11))!, type: "RecordReference" as const,
      configJson: { recordReference: { objectDefinitionId: fixtureId(500) } } };
    s.attributes.set(reference.id, reference);
    const title = { ...s.attributes.get(fixtureId(10))!, id: fixtureId(501), objectDefinitionId: fixtureId(500) };
    s.attributes.set(title.id, title);
    const target = { id: fixtureId(502), objectDefinitionId: fixtureId(500), createdAt: "2026-01-01T00:00:00Z" };
    s.records.set(target.id, target);
    const template = s.values.get(valueKey("RECORD", fixtureId(70), fixtureId(10)))![0]!;
    s.values.set(valueKey("RECORD", target.id, title.id), [{ ...template, id: fixtureId(503), ownerId: target.id, attributeDefinitionId: title.id, textValue: "Linked company" }]);
    s.titles.push({ ...s.titles[0]!, id: fixtureId(504), attributeDefinitionId: title.id });
    for (const id of [fixtureId(70), fixtureId(71)])
      s.values.set(valueKey("RECORD", id, reference.id), [{ ...template, id: id === fixtureId(70) ? fixtureId(505) : fixtureId(506),
        ownerId: id, attributeDefinitionId: reference.id, attributeType: "RecordReference", textValue: null,
        jsonValue: { targetRecordDefinitionId: target.id, targetObjectDefinitionId: target.objectDefinitionId } }]);
    const binding = s.configuration.viewAttributeSettingDefinitions[1]!;
    s.configuration.viewAttributeSettingDefinitions.push({ ...binding, id: fixtureId(507), attributeDefinitionId: title.id, referenceAttributeIdPathJson: [reference.id] });
    s.configuration.viewFilterGroupDefinitions.push({ ...binding, id: fixtureId(508), parentViewFilterGroupDefinitionId: null, conditionGroupOperator: "AND" });
    s.configuration.viewFilterConditionDefinitions.push({ ...binding, id: fixtureId(509), viewFilterGroupDefinitionId: fixtureId(508),
      comparisonOperator: "eq", comparisonValueJson: { value: target.id }, multiValueMatchMode: "ANY" });
    const ports = setup(s);
    const loaded = await ports.loader.load(s.configuration, s.source, transaction);
    const result = readViewData(new ViewDataQueryContext(loaded, {}, fixtureUser, new EncryptedViewDataTokenCodec("loader")));
    if (result.state !== "READY" || result.part !== "MAIN" || result.viewType !== "TABLE") throw Error("TABLE expected");
    expect(result.data.items[0]?.cells.find(cell => cell.bindingId === binding.id)?.values[0]?.value).toMatchObject({ label: "Linked company" });
    expect(result.data.items[0]?.cells.find(cell => cell.bindingId === fixtureId(507))?.values[0]?.value).toBe("Linked company");
    expect(result.summary?.matchedItemCount).toBe(3);
  });
  it("fails before reading values for a missing source List", async () => {
    const s = viewDataFixture("TABLE"); const ports = setup(s); ports.entries.exists.mockResolvedValue(false);
    await expect(ports.loader.load(s.configuration, s.source, transaction)).rejects.toBeInstanceOf(ViewDataConfigurationError);
    expect(ports.records.values).not.toHaveBeenCalled();
  });
  it("rejects a scan limit instead of returning the first arbitrary source page", async () => {
    const s = viewDataFixture("TABLE"); const ports = setup(s);
    ports.entries.list.mockResolvedValue(Array.from({ length: 5001 }, (_, index) => ({ ...s.items[0]!.entry!, id: fixtureId(1000 + index) })));
    await expect(ports.loader.load(s.configuration, s.source, transaction)).rejects.toMatchObject({ code: "ViewDataQueryLimitExceeded" });
  });
});

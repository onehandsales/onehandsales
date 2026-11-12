import type { TransactionContext, TransactionManager } from "@/shared/application/ports/transaction-manager.port";
import type { ViewDataConfiguration } from "./ports/view-data-configuration-query.port";
import type { ViewConfigurationCommandRepository } from "./ports/view-configuration-command.repository";
import { ViewConfigurationService } from "./view-configuration-application.service";
import { mergeViewConfiguration, parseViewConfigurationChanges, viewConfigurationSections } from "./view-configuration";
import { ViewDataLoader } from "./view-data/view-data-loader";
import { fixtureId, fixtureUser, viewDataFixture } from "./view-data/view-data.fixture";

// 기능 : 실제 설정 실행기를 사용해 쓰기 전에 권한·버전·조건을 검증합니다.
describe("ViewConfigurationService", () => {
  const context: TransactionContext = { transactionId: Symbol("configuration-test") };
  const scope = { workspaceId: fixtureId(3), viewDefinitionId: fixtureId(4) };
  let snapshot: ReturnType<typeof viewDataFixture>, saved: ViewDataConfiguration, service: ViewConfigurationService;
  let commands: jest.Mocked<ViewConfigurationCommandRepository>;
  const membership = jest.fn(), lock = jest.fn();
  const access = jest.fn(), logger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() };
  beforeEach(() => {
    snapshot = viewDataFixture("TABLE"); saved = structuredClone(snapshot.configuration);
    membership.mockReset().mockResolvedValue(true); lock.mockReset().mockResolvedValue(true);
    access.mockReset().mockResolvedValue({ workspaceMemberId: fixtureId(8), actorId: fixtureId(9) });
    Object.values(logger).forEach(method => method.mockReset());
    commands = { lock, save: jest.fn<Promise<void>, Parameters<ViewConfigurationCommandRepository["save"]>>(async (_before, after) => { saved = structuredClone(after); }) };
    const transactions: TransactionManager = { async runInTransaction(work) {
      const before = structuredClone(saved);
      try { return await work(context); } catch (error) { saved = before; throw error; }
    } };
    service = new ViewConfigurationService(
      { hasWorkspaceMembership: membership, getWorkspaceMemberAccess: access },
      { hasMembership: membership, actors: async () => [] },
      { read: async () => structuredClone(saved), titles: async () => [] }, commands,
      { fingerprint: value => JSON.stringify(value), encode: value => JSON.stringify(value), decode: token => JSON.parse(token) },
      { run: work => work(context) }, transactions,
      { list: async () => [...snapshot.attributes.values()] },
      { findAttributes: async (_workspace, ids) => ids.flatMap(id => snapshot.attributes.has(id) ? [snapshot.attributes.get(id)!] : []), findOptions: async () => ({ selectOptions: [], statusOptions: [...snapshot.options.values()] }) },
      { actorOptions: async () => [] }, { find: async () => [] }, logger,
      { load: async (configuration: ViewDataConfiguration) => ({ ...snapshot, configuration }) } as unknown as ViewDataLoader,
    );
  });
  // 기능 : 같은 공개 조회로 실제 기준 버전을 받습니다.
  async function version() { return (await service.get(fixtureUser, scope, {})).configurationVersion; }
  // 기능 : 숫자 정렬 설정을 공개 계약 형식으로 구성합니다.
  function sort() { return { viewSortDefinitions: [{ id: fixtureId(200), sourceScope: "RECORD", attributeDefinitionId: fixtureId(11), referenceAttributeIdPathJson: [], sortDirection: "DESC", sortOrder: 0, configJson: null }] }; }
  it("previews global sorting without writing or changing the saved version", async () => {
    const baseConfigurationVersion = await version();
    const result = await service.preview(fixtureUser, scope, { baseConfigurationVersion, changes: { sorts: sort() } }, {});
    expect(result.viewType).toBe("TABLE");
    if (result.viewType === "TABLE" && result.state === "READY") expect(result.data.items[0]?.recordDefinitionId).toBe(fixtureId(71));
    expect(commands.save).not.toHaveBeenCalled(); expect(await version()).toBe(baseConfigurationVersion);
  });
  it("saves labels, sorting and filters together and preserves missing sections", async () => {
    const settings = viewConfigurationSections(saved).settings;
    settings.viewAttributeSettingDefinitions[0]!.labelOverride = "  고객사  ";
    const response = await service.update(fixtureUser, scope, { baseConfigurationVersion: await version(), changes: { settings, sorts: sort() } }, {}, "request");
    expect(response.settings.viewAttributeSettingDefinitions[0]?.labelOverride).toBe("고객사");
    expect(response.sorts.viewSortDefinitions).toHaveLength(1);
    expect(response.filters.viewFilterConditionDefinitions).toEqual([]);
    expect(commands.save).toHaveBeenCalledWith(expect.anything(), expect.anything(), expect.anything(), fixtureId(9), context);
    await service.update(fixtureUser, scope, { baseConfigurationVersion: response.configurationVersion, changes: { sorts: { viewSortDefinitions: [] } } }, {}, null);
    expect(saved.viewAttributeSettingDefinitions[0]?.labelOverride).toBe("고객사"); expect(saved.viewSortDefinitions).toEqual([]);
  });
  it("rejects a stale change but treats an identical retry as a no-op", async () => {
    const baseConfigurationVersion = await version(), changes = { sorts: sort() };
    await service.update(fixtureUser, scope, { baseConfigurationVersion, changes }, {}, null);
    await service.update(fixtureUser, scope, { baseConfigurationVersion, changes }, {}, null);
    expect(commands.save).toHaveBeenCalledTimes(1);
    await expect(service.update(fixtureUser, scope, { baseConfigurationVersion, changes: { sorts: { viewSortDefinitions: [] } } }, {}, null)).rejects.toMatchObject({ code: "ViewConfigurationConflict" });
    expect(commands.save).toHaveBeenCalledTimes(1);
  });
  it("validates invalid filters even when the source is empty", async () => {
    snapshot.items = [];
    const group = { id: fixtureId(201), parentViewFilterGroupDefinitionId: null, conditionGroupOperator: "AND", sortOrder: 0 };
    const condition = { id: fixtureId(202), viewFilterGroupDefinitionId: group.id, sourceScope: "RECORD", attributeDefinitionId: fixtureId(11), referenceAttributeIdPathJson: [], sortOrder: 0, multiValueMatchMode: "ANY", comparisonOperator: "contains", comparisonValueJson: { value: "1" } };
    await expect(service.update(fixtureUser, scope, { baseConfigurationVersion: await version(), changes: { filters: { viewFilterGroupDefinitions: [group], viewFilterConditionDefinitions: [condition] } } }, {}, null)).rejects.toMatchObject({ code: "ViewConfigurationInvalid" });
    expect(commands.save).not.toHaveBeenCalled();
  });
  it("rejects cyclic groups and rolls back a storage failure", async () => {
    const baseConfigurationVersion = await version();
    await expect(service.preview(fixtureUser, scope, { baseConfigurationVersion, changes: { filters: { viewFilterGroupDefinitions: [{ id: fixtureId(200), parentViewFilterGroupDefinitionId: fixtureId(200), conditionGroupOperator: "AND", sortOrder: 0 }], viewFilterConditionDefinitions: [] } } }, {})).rejects.toMatchObject({ code: "ViewConfigurationInvalid" });
    commands.save.mockImplementationOnce(async (_before, after) => { saved = structuredClone(after); throw new Error("storage"); });
    await expect(service.update(fixtureUser, scope, { baseConfigurationVersion, changes: { sorts: sort() } }, {}, null)).rejects.toThrow("storage");
    expect(await version()).toBe(baseConfigurationVersion);
  });
  it("rechecks workspace access before reading configuration", async () => {
    membership.mockResolvedValue(false);
    await expect(service.get(fixtureUser, scope, {})).rejects.toMatchObject({ code: "ViewConfigurationNotFound" });
  });
  it("logs input and membership failures without logging supplied values", async () => {
    await expect(service.update(fixtureUser, scope, { baseConfigurationVersion: "secret-version", changes: { unexpected: "private-input" } }, {}, "request")).rejects.toMatchObject({ code: "ViewConfigurationInvalid" });
    expect(logger.warn).toHaveBeenLastCalledWith(JSON.stringify({ event: "view.configuration.failed", requestId: "request", userId: fixtureUser.id, ...scope, errorCode: "ViewConfigurationInvalid" }), "ViewConfigurationService");
    access.mockResolvedValue(null);
    await expect(service.update(fixtureUser, scope, { baseConfigurationVersion: "secret-version", changes: { sorts: sort() } }, {}, "request")).rejects.toMatchObject({ code: "ViewConfigurationNotFound" });
    expect(logger.warn).toHaveBeenCalledTimes(2);
    expect(lock).not.toHaveBeenCalled();
    expect(JSON.stringify(logger.warn.mock.calls)).not.toMatch(/secret-version|private-input/);
  });
  it("logs unexpected storage failures at error level without leaking provider messages", async () => {
    commands.save.mockRejectedValueOnce(new Error("private database details"));
    await expect(service.update(fixtureUser, scope, { baseConfigurationVersion: await version(), changes: { sorts: sort() } }, {}, "request")).rejects.toThrow("private database details");
    expect(logger.error).toHaveBeenCalledWith(JSON.stringify({ event: "view.configuration.failed", requestId: "request", userId: fixtureUser.id, ...scope, errorCode: "InternalServerError" }), undefined, "ViewConfigurationService");
    expect(logger.log).not.toHaveBeenCalled(); expect(logger.warn).not.toHaveBeenCalled();
  });
  it("places new rows after existing equal priorities with a stable preview fingerprint", () => {
    const settings = viewConfigurationSections(saved).settings;
    const original = settings.viewAttributeSettingDefinitions[0]!;
    settings.viewAttributeSettingDefinitions.push({ ...original, id: fixtureId(7), attributeDisplayRole: "DISPLAY" });
    const first = mergeViewConfiguration(saved, { settings }), second = mergeViewConfiguration(saved, { settings });
    expect(first.viewAttributeSettingDefinitions.map(row => row.id)).toEqual([original.id, fixtureId(7), fixtureId(41)]);
    expect(first).toEqual(second);
  });
  it.each([{ settings: null }, { settings: {} }, { unknown: true }, { sorts: { viewSortDefinitions: [], workspaceId: fixtureId(3) } }, {}])("rejects malformed or internal fields %j", input => {
    expect(() => parseViewConfigurationChanges(input)).toThrow(expect.objectContaining({ code: "ViewConfigurationInvalid" }));
  });
});

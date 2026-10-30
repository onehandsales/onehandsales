import { EncryptedViewDataTokenCodec } from "../../infrastructure/view-data-token-codec";
import { ViewDataQueryContext } from "./view-data-query-context";
import { readViewData } from "./view-data-readers";
import { fixtureId, fixtureUser, viewDataFixture } from "./view-data.fixture";
import {
  ViewDataConfigurationError,
  ViewDataNeedsConfiguration,
} from "./view-data.errors";
import { valueKey } from "./view-data-json";
import { decimalRatio, decimalString, decimalUnits } from "./view-data-decimal";
import { resolveViewSource } from "./view-data-loader";

const codec = new EncryptedViewDataTokenCodec("unit-test-key");
const now = Date.parse("2026-11-01T00:00:00Z");
const VIEW_DEFINITION_TYPES = [
  "TABLE",
  "KANBAN",
  "LIST",
  "GALLERY",
  "CALENDAR",
  "TIMELINE",
  "GANTT",
  "CHART",
  "PIVOT",
  "MAP",
  "DASHBOARD",
] as const;
// 기능 : 11개 타입을 같은 공통 진입 함수로 실행하여 계약 분기 누락을 검사합니다.
describe("View main query business rules", () => {
  it.each(VIEW_DEFINITION_TYPES)("executes %s with Entry grain", (type) => {
    const response = readViewData(
      new ViewDataQueryContext(
        viewDataFixture(type),
        {},
        fixtureUser,
        codec,
        now,
        true,
      ),
    );
    expect(response).toMatchObject({
      state: "READY",
      viewType: type,
      part: "MAIN",
    });
    if (type !== "DASHBOARD") expect(response.summary?.sourceItemCount).toBe(3);
  });
  it.each(["CHART", "PIVOT"] as const)(
    "aggregates duplicate record Entries exactly for %s",
    (type) => {
      const response = readViewData(
        new ViewDataQueryContext(
          viewDataFixture(type),
          {},
          fixtureUser,
          codec,
          now,
          true,
        ),
      );
      if (response.state !== "READY" || response.part !== "MAIN")
        throw Error("Expected main result");
      const total =
        response.viewType === "CHART"
          ? response.data.total
          : response.viewType === "PIVOT"
            ? response.data.grandTotal
            : null;
      expect(total).toEqual({ value: "0.4", itemCount: 3, valueCount: 3 });
    },
  );
  it("filters before pagination and applies null placement independently of DESC", () => {
    const snapshot = viewDataFixture("TABLE"),
      row = snapshot.configuration.viewAttributeSettingDefinitions[1]!;
    snapshot.configuration.viewFilterGroupDefinitions.push({
      ...row,
      parentViewFilterGroupDefinitionId: null,
      conditionGroupOperator: "AND",
    });
    snapshot.configuration.viewFilterConditionDefinitions.push({
      ...row,
      viewFilterGroupDefinitionId: row.id,
      comparisonOperator: "gte",
      comparisonValueJson: { value: "0.2" },
      multiValueMatchMode: "ANY",
    });
    const response = readViewData(
      new ViewDataQueryContext(snapshot, { limit: 1 }, fixtureUser, codec, now),
    );
    expect(response.summary).toEqual({
      sourceItemCount: 3,
      matchedItemCount: 1,
      eligibleItemCount: 1,
    });
    if (
      response.state === "READY" &&
      response.part === "MAIN" &&
      response.viewType === "TABLE"
    )
      expect(response.data.items[0]?.title).toBe("Record 2");
  });
  it("rejects malformed filter trees even when no source items exist", () => {
    const snapshot = viewDataFixture("TABLE"),
      row = snapshot.configuration.viewAttributeSettingDefinitions[0]!;
    snapshot.items = [];
    snapshot.configuration.viewFilterGroupDefinitions.push({
      ...row,
      parentViewFilterGroupDefinitionId: row.id,
      conditionGroupOperator: "AND",
    });
    expect(
      () => new ViewDataQueryContext(snapshot, {}, fixtureUser, codec, now),
    ).toThrow(ViewDataConfigurationError);
  });
  it("uses independent cursors and rejects changes in configuration or owner", () => {
    const snapshot = viewDataFixture("TABLE"),
      first = new ViewDataQueryContext(
        snapshot,
        { limit: 1 },
        fixtureUser,
        codec,
        now,
      );
    const cursor = first.page(first.items).pageInfo.nextCursor!;
    const second = new ViewDataQueryContext(
      snapshot,
      { limit: 1, cursor },
      fixtureUser,
      codec,
      now,
    );
    expect(second.page(second.items).items[0]?.key).not.toBe(
      first.items[0]?.key,
    );
    const other = new ViewDataQueryContext(
      snapshot,
      { cursor },
      { ...fixtureUser, id: fixtureId(999) },
      codec,
      now,
    );
    expect(() => other.page(other.items)).toThrow("Cursor does not match");
    snapshot.configuration.view = {
      ...snapshot.configuration.view,
      name: "Changed",
    };
    const stale = new ViewDataQueryContext(
      snapshot,
      { cursor },
      fixtureUser,
      codec,
      now,
    );
    expect(() => stale.page(stale.items)).toThrow("configuration changed");
    expect(() => codec.decode(cursor.slice(0, -5) + "AAAAA")).toThrow();
  });
  it("does not use body cursors for another Kanban group", () => {
    const context = new ViewDataQueryContext(
      viewDataFixture("KANBAN"),
      { limit: 1 },
      fixtureUser,
      codec,
      now,
    );
    const response = readViewData(context);
    if (
      response.state !== "READY" ||
      response.part !== "MAIN" ||
      response.viewType !== "KANBAN"
    )
      throw Error("Expected kanban");
    const first = response.data.columns.find(
      (column) => column.pageInfo.hasNextPage,
    )!;
    const request = {
      part: "GROUP_ITEMS" as const,
      groupToken: first.groupToken,
      cursor: first.pageInfo.nextCursor!,
    };
    const page = readViewData(
      new ViewDataQueryContext(
        viewDataFixture("KANBAN"),
        request,
        fixtureUser,
        codec,
        now,
      ),
    );
    expect(page.part).toBe("GROUP_ITEMS");
    expect(
      page.state === "READY" &&
        page.part === "GROUP_ITEMS" &&
        page.data.items.length,
    ).toBe(1);
  });
  it("requires an explicit source for dual-owned Views", () => {
    const view = {
      ...viewDataFixture("TABLE").configuration.view,
      objectDefinitionId: fixtureId(5),
    };
    expect(() => resolveViewSource(view, {})).toThrow("sourceType is required");
    expect(resolveViewSource(view, { sourceType: "LIST" }).itemKind).toBe(
      "LIST_ENTRY",
    );
  });
  it.each(["CALENDAR", "TIMELINE", "GANTT"] as const)(
    "keeps missing-end handling correct for %s",
    (type) => {
      const response = readViewData(
        new ViewDataQueryContext(
          viewDataFixture(type),
          {},
          fixtureUser,
          codec,
          now,
          true,
        ),
      );
      if (
        response.state !== "READY" ||
        response.part !== "MAIN" ||
        !("unscheduledCount" in response.data)
      )
        throw Error("Expected dates");
      expect(response.data.unscheduledCount).toBe(type === "CALENDAR" ? 0 : 1);
      expect(response.summary?.eligibleItemCount).toBe(
        type === "CALENDAR" ? 3 : 2,
      );
    },
  );
  it("tests both end-date policies without silently choosing the product default", () => {
    const request = { rangeStart: "2026-11-11", rangeEnd: "2026-11-12" };
    const run = (inclusive: boolean | null) =>
      readViewData(
        new ViewDataQueryContext(
          viewDataFixture("CALENDAR"),
          request,
          fixtureUser,
          codec,
          now,
          inclusive,
        ),
      );
    expect(run(true).summary?.eligibleItemCount).toBe(2);
    expect(run(false).summary?.eligibleItemCount).toBe(0);
    expect(() => run(null)).toThrow(ViewDataNeedsConfiguration);
  });
  it("accepts 0,0 coordinates and retains unlocated records", () => {
    const response = readViewData(
      new ViewDataQueryContext(
        viewDataFixture("MAP"),
        {},
        fixtureUser,
        codec,
        now,
      ),
    );
    if (
      response.state !== "READY" ||
      response.part !== "MAIN" ||
      response.viewType !== "MAP"
    )
      throw Error("Expected map");
    expect(response.data.markers.items).toHaveLength(2);
    expect(response.data.bounds).toEqual({
      west: 0,
      east: 0,
      south: 0,
      north: 0,
    });
    expect(response.data.unlocatedCount).toBe(1);
  });
  it("does not convert missing measures or sparse pivot combinations to zero", () => {
    const snapshot = viewDataFixture("PIVOT");
    const key = valueKey("RECORD", fixtureId(71), fixtureId(11));
    snapshot.values.set(key, [
      { ...snapshot.values.get(key)![0]!, numberValue: null },
    ]);
    const response = readViewData(
      new ViewDataQueryContext(snapshot, {}, fixtureUser, codec, now),
    );
    if (
      response.state !== "READY" ||
      response.part !== "MAIN" ||
      response.viewType !== "PIVOT"
    )
      throw Error("Expected pivot");
    expect(response.data.cells).toHaveLength(2);
    expect(response.data.cells.some((cell) => cell.result.value === null)).toBe(
      true,
    );
    expect(response.data.grandTotal.value).toBe("0.2");
  });
  it("preserves decimal precision beyond Number and rounds progress once", () => {
    expect(
      decimalString(
        decimalUnits("999999999999999999.9999999999") +
          decimalUnits("0.0000000001"),
      ),
    ).toBe("1000000000000000000");
    expect(decimalRatio("1", "3")).toBe("0.3333333333");
  });
});

import { describe, expect, it } from "vitest";
import {
  getAttributeDefinitionTargetPlacementPosition,
  reorderAttributeDefinitionsByTargetIndex,
  reorderAttributeDefinitionsByTargetPlacementPosition,
} from "@/features/crm-object/utils/attribute-definition-placement";

const columns = [
  { id: "A" },
  { id: "B" },
  { id: "C" },
  { id: "D" },
  { id: "E" },
  { id: "F" },
  { id: "G" },
] as const;

// 기능 : AttributeDefinition 위치 변경 helper의 순서 계산을 검증합니다.
describe("reorderAttributeDefinitionsByTargetIndex", () => {
  it("moves a source item between the requested neighbors", () => {
    const result = reorderAttributeDefinitionsByTargetIndex(columns, "B", 5);

    expect(result.map((column) => column.id)).toEqual([
      "A",
      "C",
      "D",
      "E",
      "F",
      "B",
      "G",
    ]);
  });

  it("keeps the original items when the source is missing", () => {
    const result = reorderAttributeDefinitionsByTargetIndex(columns, "Z", 2);

    expect(result).toBe(columns);
  });
});

// 기능 : AttributeDefinition 위치 변경 API 요청 값 계산을 검증합니다.
describe("getAttributeDefinitionTargetPlacementPosition", () => {
  it("uses the previous neighbor as an after placement for middle moves", () => {
    const result = getAttributeDefinitionTargetPlacementPosition(
      columns,
      "B",
      5,
    );

    expect(result).toEqual({
      referenceAttributeDefinitionId: "F",
      side: "after",
    });
  });

  it("uses the next neighbor as a before placement for first-column moves", () => {
    const result = getAttributeDefinitionTargetPlacementPosition(
      columns,
      "F",
      0,
    );

    expect(result).toEqual({
      referenceAttributeDefinitionId: "A",
      side: "before",
    });
  });

  it("returns null when the target order is unchanged", () => {
    const result = getAttributeDefinitionTargetPlacementPosition(
      columns,
      "B",
      1,
    );

    expect(result).toBeNull();
  });
});

// 기능 : AttributeDefinition 위치 변경 API 요청 값 기반 optimistic reorder를 검증합니다.
describe("reorderAttributeDefinitionsByTargetPlacementPosition", () => {
  it("moves a source item after the reference item", () => {
    const result = reorderAttributeDefinitionsByTargetPlacementPosition(
      columns,
      "B",
      {
        referenceAttributeDefinitionId: "F",
        side: "after",
      },
    );

    expect(result.map((column) => column.id)).toEqual([
      "A",
      "C",
      "D",
      "E",
      "F",
      "B",
      "G",
    ]);
  });

  it("moves a source item before the reference item", () => {
    const result = reorderAttributeDefinitionsByTargetPlacementPosition(
      columns,
      "F",
      {
        referenceAttributeDefinitionId: "A",
        side: "before",
      },
    );

    expect(result.map((column) => column.id)).toEqual([
      "F",
      "A",
      "B",
      "C",
      "D",
      "E",
      "G",
    ]);
  });
});

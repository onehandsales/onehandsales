import type { AttributeDefinitionTargetPlacementPosition } from "@/features/crm-object/api/attribute-definition-api";

// 역할 : 위치를 계산할 AttributeDefinition 식별 값을 정의합니다.
export type AttributeDefinitionPlacementItem = {
  readonly id: string;
};

// 기능 : AttributeDefinition 컬럼을 source 제거 후 targetIndex 위치로 재배치합니다.
export function reorderAttributeDefinitionsByTargetIndex<
  TItem extends AttributeDefinitionPlacementItem,
>(
  items: readonly TItem[],
  sourceAttributeDefinitionId: string,
  targetIndex: number,
): readonly TItem[] {
  // 1. 이동할 source와 source를 제외한 기준 목록을 준비한다.
  const sourceItem = items.find(
    (item) => item.id === sourceAttributeDefinitionId,
  );

  if (!sourceItem) {
    return items;
  }

  const remainingItems = items.filter(
    (item) => item.id !== sourceAttributeDefinitionId,
  );
  const boundedTargetIndex = getBoundedTargetIndex(
    targetIndex,
    remainingItems.length,
  );

  // 2. source를 제거한 목록의 targetIndex 지점에 source를 삽입한다.
  return [
    ...remainingItems.slice(0, boundedTargetIndex),
    sourceItem,
    ...remainingItems.slice(boundedTargetIndex),
  ];
}

// 기능 : targetIndex 기반 이동 결과를 Backend targetPlacementPosition 요청 값으로 변환합니다.
export function getAttributeDefinitionTargetPlacementPosition<
  TItem extends AttributeDefinitionPlacementItem,
>(
  items: readonly TItem[],
  sourceAttributeDefinitionId: string,
  targetIndex: number,
): AttributeDefinitionTargetPlacementPosition | null {
  // 1. 이동 결과가 현재 순서와 같으면 Backend 요청을 만들지 않는다.
  const reorderedItems = reorderAttributeDefinitionsByTargetIndex(
    items,
    sourceAttributeDefinitionId,
    targetIndex,
  );

  if (areAttributeDefinitionOrdersEqual(items, reorderedItems)) {
    return null;
  }

  // 2. source의 왼쪽 이웃을 우선 기준으로 삼고, 맨 앞 이동이면 오른쪽 이웃 before로 표현한다.
  const sourceIndex = reorderedItems.findIndex(
    (item) => item.id === sourceAttributeDefinitionId,
  );

  if (sourceIndex < 0) {
    return null;
  }

  const previousItem = reorderedItems[sourceIndex - 1];

  if (previousItem) {
    return {
      referenceAttributeDefinitionId: previousItem.id,
      side: "after",
    };
  }

  const nextItem = reorderedItems[sourceIndex + 1];

  if (nextItem) {
    return {
      referenceAttributeDefinitionId: nextItem.id,
      side: "before",
    };
  }

  return null;
}

// 기능 : Backend targetPlacementPosition 기준으로 AttributeDefinition 목록을 재배치합니다.
export function reorderAttributeDefinitionsByTargetPlacementPosition<
  TItem extends AttributeDefinitionPlacementItem,
>(
  items: readonly TItem[],
  sourceAttributeDefinitionId: string,
  targetPlacementPosition: AttributeDefinitionTargetPlacementPosition,
): readonly TItem[] {
  // 1. source와 reference가 모두 있는 경우에만 optimistic reorder를 수행한다.
  const sourceItem = items.find(
    (item) => item.id === sourceAttributeDefinitionId,
  );

  if (!sourceItem) {
    return items;
  }

  const remainingItems = items.filter(
    (item) => item.id !== sourceAttributeDefinitionId,
  );
  const referenceIndex = remainingItems.findIndex(
    (item) => item.id === targetPlacementPosition.referenceAttributeDefinitionId,
  );

  if (referenceIndex < 0) {
    return items;
  }

  // 2. 기준 AttributeDefinition 앞/뒤 방향을 source 제거 후 targetIndex로 변환한다.
  const targetIndex =
    targetPlacementPosition.side === "before"
      ? referenceIndex
      : referenceIndex + 1;

  return [
    ...remainingItems.slice(0, targetIndex),
    sourceItem,
    ...remainingItems.slice(targetIndex),
  ];
}

// 기능 : source를 제외한 목록 길이 안으로 targetIndex를 보정합니다.
function getBoundedTargetIndex(targetIndex: number, remainingItemCount: number) {
  if (!Number.isFinite(targetIndex)) {
    return remainingItemCount;
  }

  return Math.min(Math.max(Math.round(targetIndex), 0), remainingItemCount);
}

// 기능 : AttributeDefinition 목록의 순서가 같은지 비교합니다.
function areAttributeDefinitionOrdersEqual<
  TItem extends AttributeDefinitionPlacementItem,
>(leftItems: readonly TItem[], rightItems: readonly TItem[]) {
  if (leftItems.length !== rightItems.length) {
    return false;
  }

  return leftItems.every((item, index) => item.id === rightItems[index]?.id);
}

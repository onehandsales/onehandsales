import { DomainError } from "@/shared/domain/errors/domain-error";

// 역할 : 정렬 API의 저장 결과와 변경 대상 행을 표현합니다.
export interface OrderedItem { readonly id: string; readonly sortOrder: number }
// 역할 : 순서 변경 API가 반환하는 최종 목록입니다.
export interface ReorderSidebarItemsResponse { readonly items: readonly OrderedItem[] }

// 역할 : 현재 소유 범위의 ID 목록과 요청 목록이 달라진 상태입니다.
export class SidebarOrderConflictError extends DomainError {
  // 기능 : 다른 사용자의 식별자나 DB 원문 없이 목록 재조회를 요청합니다.
  constructor() { super("SidebarOrderConflict", "Sidebar items changed; reload the list and try again"); }
}

// 기능 : HTTP 외 호출에도 UUID 형식과 대소문자를 정규화하고 중복을 거부합니다.
export function normalizeOrderedIds(value: unknown): string[] {
  // 1. 누락/null/원시값과 UUID가 아닌 요소를 거부한다.
  if (!Array.isArray(value) || value.some(id => typeof id !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))) {
    throw new DomainError("ValidationError", "orderedIds must be a UUID array", { field: "orderedIds" });
  }
  const ids = (value as string[]).map(id => id.toLowerCase());
  if (new Set(ids).size !== ids.length) {
    throw new DomainError("ValidationError", "orderedIds must not contain duplicates", { field: "orderedIds" });
  }
  return ids;
}

// 기능 : 전체 ID 집합을 검증하고 최종 순서 및 실제 변경 행을 계산합니다.
export function planItemOrder(ids: readonly string[], current: readonly OrderedItem[]) {
  // 1. 소유 저장소가 읽은 현재 전체 목록과 요청 집합을 정확히 비교한다.
  const byId = new Map(current.map(item => [item.id.toLowerCase(), item.sortOrder]));
  if (ids.length !== current.length || byId.size !== current.length || ids.some(id => !byId.has(id))) {
    throw new SidebarOrderConflictError();
  }
  const items = ids.map((id, sortOrder) => ({ id, sortOrder }));
  return { items, changed: items.filter(item => byId.get(item.id) !== item.sortOrder) };
}

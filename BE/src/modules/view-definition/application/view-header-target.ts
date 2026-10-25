export const VIEW_HEADER_TARGET_TYPES = ["OBJECT", "LIST"] as const;
export type ViewHeaderTargetType = (typeof VIEW_HEADER_TARGET_TYPES)[number];

// 역할 : 사이드바에서 클릭한 관리 항목 또는 업무 목록의 식별자를 정의합니다.
export interface ViewHeaderTargetInput {
  readonly targetType: ViewHeaderTargetType;
  readonly targetId: string;
}

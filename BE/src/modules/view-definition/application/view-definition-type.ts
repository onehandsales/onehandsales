// 역할 : ORM에 의존하지 않는 View 화면 표현 타입을 정의합니다.
export type ViewDefinitionType =
  | "TABLE"
  | "KANBAN"
  | "LIST"
  | "GALLERY"
  | "CALENDAR"
  | "TIMELINE"
  | "GANTT"
  | "CHART"
  | "PIVOT"
  | "MAP"
  | "DASHBOARD";

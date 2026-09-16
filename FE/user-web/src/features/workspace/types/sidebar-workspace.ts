// 역할 : SidebarWorkspaceSummary 사이드바와 Workspace loading에서 사용할 Workspace 요약입니다.
export type SidebarWorkspaceSummary = {
  readonly id: string;
  readonly name: string;
  readonly kind: "PERSONAL" | "ORGANIZATION";
};

// 역할 : SidebarCrmObjectListItem 사이드바 관리 항목 목록에서 사용할 CRM Object 요약입니다.
export type SidebarCrmObjectListItem = {
  readonly id: string;
  readonly icon: string | null;
  readonly pluralName: string;
  readonly singularName: string;
};

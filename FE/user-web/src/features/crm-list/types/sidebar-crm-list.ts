// 역할 : 사이드바 업무 목록에 표시할 List 요약 응답을 정의합니다.
export type SidebarCrmListItem = {
  readonly id: string;
  readonly icon: string | null;
  readonly name: string;
};

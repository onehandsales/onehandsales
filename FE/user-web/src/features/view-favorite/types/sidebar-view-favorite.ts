// 역할 : 즐겨찾기 ID와 실제 View ID를 구분하는 사이드바 응답을 정의합니다.
export type SidebarViewFavoriteItem = {
  readonly id: string;
  readonly viewDefinitionId: string;
  readonly name: string;
  readonly icon: string | null;
};

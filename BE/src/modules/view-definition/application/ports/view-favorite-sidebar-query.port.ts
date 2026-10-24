export const VIEW_FAVORITE_SIDEBAR_QUERY = Symbol("VIEW_FAVORITE_SIDEBAR_QUERY");

// 역할 : 인증 사용자로 확인한 개인 즐겨찾기 조회 범위를 정의합니다.
export interface SidebarViewFavoriteQueryInput {
  readonly workspaceId: string;
  readonly workspaceMemberId: string;
}

// 역할 : 사이드바에 필요한 즐겨찾기 식별자와 View 요약을 정의합니다.
export interface SidebarViewFavoriteListItem {
  readonly id: string;
  readonly viewDefinitionId: string;
  readonly name: string;
  readonly icon: string | null;
}

// 역할 : Workspace 멤버 개인의 View 즐겨찾기 조회 계약을 정의합니다.
export interface ViewFavoriteSidebarQuery {
  // 기능 : 확인된 멤버의 같은 Workspace View 즐겨찾기를 순서대로 조회합니다.
  listSidebarViewFavorites(
    input: SidebarViewFavoriteQueryInput
  ): Promise<SidebarViewFavoriteListItem[]>;
}

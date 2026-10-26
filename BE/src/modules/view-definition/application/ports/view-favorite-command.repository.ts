import type { TransactionContext } from "@/shared/application/ports/transaction-manager.port";

export const VIEW_FAVORITE_COMMAND_REPOSITORY = Symbol("VIEW_FAVORITE_COMMAND_REPOSITORY");

// 역할 : 서버가 확인한 개인 즐겨찾기 범위를 정의합니다.
export interface ViewFavoriteMemberScope {
  readonly workspaceId: string;
  readonly workspaceMemberId: string;
}

// 역할 : 개인 즐겨찾기 등록·해제 대상 View를 정의합니다.
export interface ViewFavoriteScope extends ViewFavoriteMemberScope {
  readonly viewId: string;
}

// 역할 : 서버가 결정한 순서와 생성 Actor를 저장 계약에 전달합니다.
export interface CreateViewFavoriteInput extends ViewFavoriteScope {
  readonly createdByActorId: string;
  readonly sortOrder: number;
}

// 역할 : View 소유 모듈의 즐겨찾기 변경을 같은 transaction 안에서 수행합니다.
export interface ViewFavoriteCommandRepository {
  // 기능 : 같은 멤버의 즐겨찾기 변경을 transaction이 끝날 때까지 직렬화합니다.
  lockMemberFavorites(
    scope: ViewFavoriteMemberScope,
    context: TransactionContext
  ): Promise<void>;
  // 기능 : 요청 Workspace의 View 소속을 확인하고 변경 중 대상 삭제를 막습니다.
  lockWorkspaceView(
    scope: ViewFavoriteScope,
    context: TransactionContext
  ): Promise<boolean>;
  // 기능 : 본인 대상 View에 기존 즐겨찾기가 있는지 최소 식별자로 확인합니다.
  findMemberFavorite(
    scope: ViewFavoriteScope,
    context: TransactionContext
  ): Promise<{ id: string } | null>;
  // 기능 : 개인 Workspace 목록의 마지막 저장 순서를 조회합니다.
  findLastMemberFavoriteSortOrder(
    scope: ViewFavoriteMemberScope,
    context: TransactionContext
  ): Promise<number | null>;
  // 기능 : 검증된 대상과 Actor·순서로 즐겨찾기 한 행을 생성합니다.
  createMemberFavorite(
    input: CreateViewFavoriteInput,
    context: TransactionContext
  ): Promise<{ id: string }>;
  // 기능 : 본인 해당 View의 즐겨찾기를 기존 중복까지 해제합니다.
  deleteMemberFavorites(
    scope: ViewFavoriteScope,
    context: TransactionContext
  ): Promise<number>;
}

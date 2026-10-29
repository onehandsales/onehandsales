import { Inject, Injectable } from "@nestjs/common";
import {
  VIEW_FAVORITE_COMMAND_REPOSITORY,
  type ViewFavoriteCommandRepository,
  type ViewFavoriteScope,
} from "@/modules/view-definition/application/ports/view-favorite-command.repository";
import {
  ViewFavoriteViewNotFoundError,
  ViewFavoriteWorkspaceNotFoundError,
} from "@/modules/view-definition/domain/view-definition.errors";
import {
  WORKSPACE_ACCESS_QUERY,
  type WorkspaceAccessQuery,
} from "@/modules/workspace/application/ports/workspace-access-query.port";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import {
  APPLICATION_LOGGER,
  type ApplicationLogger,
} from "@/shared/application/ports/application-logger.port";
import {
  TRANSACTION_MANAGER,
  type TransactionContext,
  type TransactionManager,
} from "@/shared/application/ports/transaction-manager.port";

// 역할 : 즐겨찾기 등록의 공개 응답 필드를 정의합니다.
export interface CreateWorkspaceViewFavoriteResponse {
  readonly viewDefinitionId: string;
  readonly isFavorite: true;
}

// 역할 : HTTP 계층이 신규 생성 여부를 상태 코드로 변환하도록 전달합니다.
export interface CreateWorkspaceViewFavoriteResult
  extends CreateWorkspaceViewFavoriteResponse {
  readonly created: boolean;
}

// 역할 : 현재 Workspace 멤버의 View 즐겨찾기를 멱등하게 등록합니다.
@Injectable()
export class CreateWorkspaceViewFavoriteUseCase {
  // 기능 : Workspace 공개 접근 계약과 View 쓰기·트랜잭션·로그 Port를 주입받습니다.
  constructor(
    @Inject(WORKSPACE_ACCESS_QUERY)
    private readonly workspaceAccess: WorkspaceAccessQuery,
    @Inject(VIEW_FAVORITE_COMMAND_REPOSITORY)
    private readonly repository: ViewFavoriteCommandRepository,
    @Inject(TRANSACTION_MANAGER)
    private readonly transactions: TransactionManager,
    @Inject(APPLICATION_LOGGER)
    private readonly logger: ApplicationLogger
  ) {}

  // 기능 : 본인 즐겨찾기가 없을 때만 개인 목록 끝에 추가합니다.
  async execute(
    currentUser: CurrentUserContext,
    workspaceId: string,
    viewDefinitionId: string,
    requestId: string | null = null
  ): Promise<CreateWorkspaceViewFavoriteResult> {
    // 1. 서버의 Workspace Port로 멤버·Actor를 확인하고 UUID 표기를 통일한다.
    const normalizedWorkspaceId = workspaceId.toLowerCase();
    const member = await this.workspaceAccess.getWorkspaceMemberAccess(
      currentUser.id,
      normalizedWorkspaceId
    );
    if (!member) {
      throw new ViewFavoriteWorkspaceNotFoundError();
    }
    const scope: ViewFavoriteScope = {
      workspaceId: normalizedWorkspaceId,
      workspaceMemberId: member.workspaceMemberId.toLowerCase(),
      viewId: viewDefinitionId.toLowerCase(),
    };

    // 2. 개인 쓰기 잠금·View 검증·중복 확인·생성을 하나의 transaction으로 묶는다.
    let favoriteId: string | null;
    try {
      favoriteId = await this.transactions.runInTransaction((context) =>
        this.createIfAbsent(scope, member.actorId, context)
      );
    } catch (error) {
      if (!(error instanceof ViewFavoriteViewNotFoundError)) {
        this.logger.error(
          JSON.stringify({ event: "crm.viewFavorite.createFailed", requestId, userId: currentUser.id, ...scope }),
          undefined,
          "CreateWorkspaceViewFavoriteUseCase"
        );
      }
      throw error;
    }

    // 3. commit된 실제 생성만 안전한 식별자로 기록한다.
    if (favoriteId) {
      this.logger.log(
        JSON.stringify({ event: "crm.viewFavorite.created", requestId, userId: currentUser.id, ...scope, favoriteId }),
        "CreateWorkspaceViewFavoriteUseCase"
      );
    }
    return { viewDefinitionId: scope.viewId, isFavorite: true, created: favoriteId !== null };
  }

  // 기능 : 개인 순서와 동일 View 중복을 보호하면서 신규 행만 저장합니다.
  private async createIfAbsent(
    scope: ViewFavoriteScope,
    actorId: string | null,
    context: TransactionContext
  ): Promise<string | null> {
    // 1. 같은 멤버의 변경을 직렬화하고 대상 View가 현재 Workspace에 있는지 확인한다.
    await this.repository.lockMemberFavorites(scope, context);
    if (!(await this.repository.lockWorkspaceView(scope, context))) {
      throw new ViewFavoriteViewNotFoundError();
    }

    // 2. 기존 등록은 Actor·순서·수정시각을 바꾸지 않고 성공으로 처리한다.
    if (await this.repository.findMemberFavorite(scope, context)) {
      return null;
    }
    if (!actorId) {
      throw new Error("Workspace member actor is missing");
    }

    // 3. 현재 개인 목록의 마지막 순서 다음에 서버 Actor로 생성한다.
    const lastSortOrder = await this.repository.findLastMemberFavoriteSortOrder(scope, context);
    const favorite = await this.repository.createMemberFavorite(
      { ...scope, createdByActorId: actorId, sortOrder: lastSortOrder === null ? 0 : lastSortOrder + 1 },
      context
    );
    return favorite.id;
  }
}

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
  type TransactionManager,
} from "@/shared/application/ports/transaction-manager.port";

// 역할 : 즐겨찾기 해제의 공개 응답 필드를 정의합니다.
export interface DeleteWorkspaceViewFavoriteResponse {
  readonly viewDefinitionId: string;
  readonly isFavorite: false;
}

// 역할 : 현재 Workspace 멤버의 해당 View 즐겨찾기만 멱등하게 해제합니다.
@Injectable()
export class DeleteWorkspaceViewFavoriteUseCase {
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

  // 기능 : Actor 유무와 관계없이 본인 해당 View의 모든 등록 행을 제거합니다.
  async execute(
    currentUser: CurrentUserContext,
    workspaceId: string,
    viewDefinitionId: string,
    requestId: string | null = null
  ): Promise<DeleteWorkspaceViewFavoriteResponse> {
    // 1. 현재 사용자의 멤버 소속을 확인하고 client의 소유자 입력을 사용하지 않는다.
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

    // 2. 등록과 같은 개인 잠금 안에서 View 검증과 범위 삭제를 원자적으로 실행한다.
    let deletedCount: number;
    try {
      deletedCount = await this.transactions.runInTransaction(async (context) => {
        // 1. 등록과 같은 잠금으로 진행 중인 개인 즐겨찾기 변경을 기다린다.
        await this.repository.lockMemberFavorites(scope, context);
        // 2. 대상 부재·다른 Workspace를 구분 없이 거부한다.
        if (!(await this.repository.lockWorkspaceView(scope, context))) {
          throw new ViewFavoriteViewNotFoundError();
        }
        // 3. 본인 해당 View의 등록만 중복까지 해제한다.
        return this.repository.deleteMemberFavorites(scope, context);
      });
    } catch (error) {
      if (!(error instanceof ViewFavoriteViewNotFoundError)) {
        this.logger.error(
          JSON.stringify({ event: "crm.viewFavorite.deleteFailed", requestId, userId: currentUser.id, ...scope }),
          undefined,
          "DeleteWorkspaceViewFavoriteUseCase"
        );
      }
      throw error;
    }

    // 3. commit된 실제 삭제만 기록하고 이미 해제된 요청도 false를 반환한다.
    if (deletedCount > 0) {
      this.logger.log(
        JSON.stringify({ event: "crm.viewFavorite.deleted", requestId, userId: currentUser.id, ...scope, deletedCount }),
        "DeleteWorkspaceViewFavoriteUseCase"
      );
    }
    return { viewDefinitionId: scope.viewId, isFavorite: false };
  }
}

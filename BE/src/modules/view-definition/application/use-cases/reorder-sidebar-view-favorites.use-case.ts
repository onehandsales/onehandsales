import { Inject, Injectable } from "@nestjs/common";
import { WORKSPACE_ACCESS_QUERY, type WorkspaceAccessQuery } from "@/modules/workspace/application/ports/workspace-access-query.port";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { TRANSACTION_MANAGER, type TransactionManager } from "@/shared/application/ports/transaction-manager.port";
import { APPLICATION_LOGGER, type ApplicationLogger } from "@/shared/application/ports/application-logger.port";
import { normalizeOrderedIds, planItemOrder, type ReorderSidebarItemsResponse } from "@/shared/application/ordering/ordered-items";
import { DomainError } from "@/shared/domain/errors/domain-error";
import { ViewFavoriteWorkspaceNotFoundError } from "../../domain/view-definition.errors";
import { SIDEBAR_FAVORITE_ORDER_REPOSITORY, type SidebarFavoriteOrderRepository } from "../ports/sidebar-favorite-order.repository";

// 역할 : Favorite 소유 범위의 전체 순서 변경을 검증하고 원자적으로 저장합니다.
@Injectable()
export class ReorderSidebarViewFavoritesUseCase {
  // 기능 : 공개 Workspace 접근 포트와 소유 저장소·공통 transaction/logger를 주입받습니다.
  constructor(
    @Inject(WORKSPACE_ACCESS_QUERY) private readonly access: WorkspaceAccessQuery,
    @Inject(SIDEBAR_FAVORITE_ORDER_REPOSITORY) private readonly repository: SidebarFavoriteOrderRepository,
    @Inject(TRANSACTION_MANAGER) private readonly transactions: TransactionManager,
    @Inject(APPLICATION_LOGGER) private readonly logger: ApplicationLogger,
  ) {}

  // 기능 : 현재 소유 목록과 요청 집합을 비교한 뒤 최종 순서로 저장합니다.
  async execute(user: CurrentUserContext, workspaceId: string, orderedIds: unknown, requestId: string | null = null): Promise<ReorderSidebarItemsResponse> {
    // 1. 검증 실패부터 추적할 수 있도록 입력 원문 없이 요청 문맥을 준비한다.
    workspaceId = workspaceId.toLowerCase();
    const fields = {
      requestId, userId: user.id, workspaceId,
      itemCount: Array.isArray(orderedIds) ? orderedIds.length : null,
      workspaceMemberId: null as string | null,
    };
    let result: ReturnType<typeof planItemOrder>;
    try {
      // 2. 형식과 멤버십을 확인하고 권한 거부·접근 조회 실패도 안전한 오류 코드로 기록한다.
      const ids = normalizeOrderedIds(orderedIds);
      const member = await this.access.getWorkspaceMemberAccess(user.id, workspaceId);
      if (!member) throw new ViewFavoriteWorkspaceNotFoundError();
      const scope = { workspaceId, workspaceMemberId: member.workspaceMemberId.toLowerCase() };
      fields.workspaceMemberId = scope.workspaceMemberId;
      // 3. 잠금 이후 현재 행을 조회하고 동일 transaction에서 변경된 행만 저장한다.
      result = await this.transactions.runInTransaction(async context => {
        await this.repository.lock(scope, context);
        const plan = planItemOrder(ids, await this.repository.list(scope, context));
        if (plan.changed.length) {
          if (!member.actorId) throw new Error("Workspace member actor is missing");
          await this.repository.save(scope, plan.changed, member.actorId, context);
        }
        return plan;
      });
    } catch (error) {
      const message = JSON.stringify({ event: "crm.sidebar.favorites.reorderFailed", ...fields, errorCode: error instanceof DomainError ? error.code : "InternalServerError" });
      if (error instanceof DomainError) this.logger.warn(message, "ReorderSidebarViewFavoritesUseCase");
      else this.logger.error(message, undefined, "ReorderSidebarViewFavoritesUseCase");
      throw error;
    }
    // 4. commit된 변경만 성공으로 기록한다. 로그 오류를 DB rollback 실패로 기록하지 않는다.
    if (result.changed.length) this.logger.log(JSON.stringify({ event: "crm.sidebar.favorites.reordered", ...fields, changedCount: result.changed.length }), "ReorderSidebarViewFavoritesUseCase");
    return { items: result.items };
  }
}

import { Prisma } from "@prisma/client";
import type { SidebarFavoriteOrderRepository, SidebarFavoriteOrderScope } from "../../application/ports/sidebar-favorite-order.repository";
import { SidebarOrderConflictError, type OrderedItem } from "@/shared/application/ordering/ordered-items";
import type { TransactionContext } from "@/shared/application/ports/transaction-manager.port";
import type { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { resolvePrismaTransactionalClient } from "@/shared/infrastructure/prisma/prisma-transaction-manager";
import type { ViewFavoriteCommandRepository } from "../../application/ports/view-favorite-command.repository";

// 역할 : ViewFavoriteDefinition의 소속을 보존하며 사이드바 순서를 저장합니다.
export class PrismaSidebarFavoriteOrderRepository implements SidebarFavoriteOrderRepository {
  // 기능 : 소유 테이블을 조회할 Prisma와 필요한 기존 잠금 구현을 받습니다.
  constructor(private readonly prisma: PrismaService, private readonly favorites: ViewFavoriteCommandRepository) {}

  // 기능 : 생성/삭제와 같은 소유 범위의 transaction 잠금을 사용합니다.
  async lock(scope: SidebarFavoriteOrderScope, context: TransactionContext): Promise<void> {
    await this.favorites.lockMemberFavorites(scope, context);
  }

  // 기능 : 현재 소유 범위의 행을 잠가 조회 후 삭제/소속 변경을 방지합니다.
  async list(scope: SidebarFavoriteOrderScope, context: TransactionContext): Promise<OrderedItem[]> {
    const client = resolvePrismaTransactionalClient(this.prisma, context);
    return client.$queryRaw<OrderedItem[]>`
      SELECT target.id, target."sortOrder" FROM "ViewFavoriteDefinition" target
      JOIN "ViewDefinition" linked_view ON linked_view.id = target."viewDefinitionId" AND linked_view."workspaceId" = target."workspaceId"
      WHERE target."workspaceId" = ${scope.workspaceId}::uuid
        AND target."workspaceMemberId" = ${scope.workspaceMemberId}::uuid
      ORDER BY target.id FOR UPDATE OF target FOR SHARE OF linked_view
    `;
  }

  // 기능 : SQL 값은 바인딩하고 조회한 소유 범위 안의 변경 행만 한 번에 갱신합니다.
  async save(scope: SidebarFavoriteOrderScope, items: readonly OrderedItem[], actorId: string, context: TransactionContext): Promise<void> {
    if (!items.length) return;
    const client = resolvePrismaTransactionalClient(this.prisma, context);
    // 1. 전체 ID를 소유 범위로 재제한하고 감사 필드를 함께 기록한다.
    const count = await client.$executeRaw`
      UPDATE "ViewFavoriteDefinition" target
      SET "sortOrder" = ordered.position, "updatedByActorId" = ${actorId}::uuid, "updatedAt" = CURRENT_TIMESTAMP
      FROM (VALUES ${Prisma.join(items.map(item => Prisma.sql`(${item.id}::uuid, ${item.sortOrder}::integer)`))}) AS ordered(id, position)
      WHERE target.id = ordered.id AND target."workspaceId" = ${scope.workspaceId}::uuid
        AND target."workspaceMemberId" = ${scope.workspaceMemberId}::uuid
    `;
    // 2. 누락된 행은 부분 성공으로 반환하지 않고 transaction 전체를 중단한다.
    if (count !== items.length) throw new SidebarOrderConflictError();
  }
}

import type {
  CreateViewFavoriteInput,
  ViewFavoriteCommandRepository,
  ViewFavoriteMemberScope,
  ViewFavoriteScope,
} from "@/modules/view-definition/application/ports/view-favorite-command.repository";
import type { TransactionContext } from "@/shared/application/ports/transaction-manager.port";
import { resolvePrismaTransactionalClient } from "@/shared/infrastructure/prisma/prisma-transaction-manager";
import type { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

// 역할 : View 즐겨찾기 쓰기 Port를 transaction에 묶인 Prisma·PostgreSQL 쿼리로 구현합니다.
export class PrismaViewFavoriteCommandRepository
  implements ViewFavoriteCommandRepository {
  // 기능 : View 소유 테이블에 접근할 기본 Prisma 서비스를 받습니다.
  constructor(private readonly prisma: PrismaService) {}

  // 기능 : 개인 즐겨찾기 변경을 직렬화하고 후속 조회의 최신 commit 가시성을 확인합니다.
  async lockMemberFavorites(
    scope: ViewFavoriteMemberScope,
    context: TransactionContext
  ): Promise<void> {
    // 1. 연결 풀에 남지 않는 transaction 잠금을 UUID 표기와 무관한 동일 key로 잡는다.
    const client = resolvePrismaTransactionalClient(this.prisma, context);
    const key = `onehandsales:view-favorite:${scope.workspaceId.toLowerCase()}:${scope.workspaceMemberId.toLowerCase()}`;
    const rows = await client.$queryRaw<{ isolationLevel: string }[]>`
      SELECT current_setting('transaction_isolation') AS "isolationLevel"
      FROM pg_advisory_xact_lock(hashtextextended(${key}, 0))
    `;
    // 2. 잠금 대기 전 snapshot을 계속 쓰는 isolation에서는 변경 전에 중단한다.
    if (rows[0]?.isolationLevel !== "read committed") {
      throw new Error("View favorite mutations require READ COMMITTED");
    }
  }

  // 기능 : 같은 Workspace의 View만 허용하고 transaction 중 삭제·소속 변경을 막습니다.
  async lockWorkspaceView(
    scope: ViewFavoriteScope,
    context: TransactionContext
  ): Promise<boolean> {
    // 1. PK로 대상만 조회하고 View 변경과 충돌하는 공유 row 잠금을 획득한다.
    const client = resolvePrismaTransactionalClient(this.prisma, context);
    const rows = await client.$queryRaw<{ id: string }[]>`
      SELECT "id" FROM "ViewDefinition"
      WHERE "id" = ${scope.viewId}::uuid AND "workspaceId" = ${scope.workspaceId}::uuid
      FOR SHARE
    `;
    return rows.length > 0;
  }

  // 기능 : 본인 대상 View의 기존 등록 여부만 읽고 과거 중복은 수정하지 않습니다.
  findMemberFavorite(
    scope: ViewFavoriteScope,
    context: TransactionContext
  ): Promise<{ id: string } | null> {
    // 1. 전체 소유 범위로 제한한 최소 select를 같은 transaction에서 실행한다.
    return resolvePrismaTransactionalClient(this.prisma, context).viewFavoriteDefinition.findFirst({
      where: {
        workspaceId: scope.workspaceId,
        workspaceMemberId: scope.workspaceMemberId,
        viewDefinitionId: scope.viewId,
      },
      select: { id: true },
    });
  }

  // 기능 : View 기본 순서와 분리된 본인 즐겨찾기 목록의 마지막 순서를 읽습니다.
  async findLastMemberFavoriteSortOrder(
    scope: ViewFavoriteMemberScope,
    context: TransactionContext
  ): Promise<number | null> {
    // 1. 해당 Workspace·멤버 범위만 집계해 다른 사용자의 순서와 분리한다.
    const result = await resolvePrismaTransactionalClient(this.prisma, context).viewFavoriteDefinition.aggregate({
      where: { workspaceId: scope.workspaceId, workspaceMemberId: scope.workspaceMemberId },
      _max: { sortOrder: true },
    });
    return result._max.sortOrder;
  }

  // 기능 : 서버에서 검증한 Actor·멤버·View·순서로 즐겨찾기 한 행을 생성합니다.
  createMemberFavorite(
    input: CreateViewFavoriteInput,
    context: TransactionContext
  ): Promise<{ id: string }> {
    // 1. client가 지정할 수 없는 감사·소유 필드를 명시적으로 저장한다.
    return resolvePrismaTransactionalClient(this.prisma, context).viewFavoriteDefinition.create({
      data: {
        workspaceId: input.workspaceId,
        workspaceMemberId: input.workspaceMemberId,
        viewDefinitionId: input.viewId,
        createdByActorId: input.createdByActorId,
        sortOrder: input.sortOrder,
      },
      select: { id: true },
    });
  }

  // 기능 : 요청자의 해당 View 등록만 기존 중복을 포함해 제거합니다.
  async deleteMemberFavorites(
    scope: ViewFavoriteScope,
    context: TransactionContext
  ): Promise<number> {
    // 1. 다른 Workspace·멤버·View를 건드리지 않고 남은 목록 순서를 보존한다.
    const result = await resolvePrismaTransactionalClient(this.prisma, context).viewFavoriteDefinition.deleteMany({
      where: {
        workspaceId: scope.workspaceId,
        workspaceMemberId: scope.workspaceMemberId,
        viewDefinitionId: scope.viewId,
      },
    });
    return result.count;
  }
}

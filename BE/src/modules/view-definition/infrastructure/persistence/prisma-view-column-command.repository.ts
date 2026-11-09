import { Prisma } from "@prisma/client";
import type { ViewColumnCommandRepository, ColumnTargetView } from "../../application/ports/view-column-command.repository";
import { ViewColumnError } from "../../domain/view-column.errors";
import type { TransactionContext } from "@/shared/application/ports/transaction-manager.port";
import type { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { resolvePrismaTransactionalClient } from "@/shared/infrastructure/prisma/prisma-transaction-manager";

// 역할 : View 컬럼 생성의 잠금·멱등성 조회·저장을 PostgreSQL 트랜잭션으로 구현합니다.
export class PrismaViewColumnCommandRepository implements ViewColumnCommandRepository {
  // 기능 : View 소유 테이블을 조회할 Prisma 연결을 받습니다.
  constructor(private readonly prisma: PrismaService) {}

  // 기능 : READ COMMITTED에서 View 변경과 컬럼 추가를 직렬화합니다.
  async lockView(workspaceId: string, viewId: string, context: TransactionContext) {
    // 1. 잠금 대기 뒤 최신 저장 상태를 읽을 수 있는 격리 수준만 허용한다.
    const client = resolvePrismaTransactionalClient(this.prisma, context);
    const isolation = await client.$queryRaw<{ level: string }[]>`SELECT current_setting('transaction_isolation') AS level`;
    if (isolation[0]?.level !== "read committed") throw new Error("View column mutations require READ COMMITTED");
    // 2. 같은 Workspace의 View만 잠그고 외부 범위는 존재 여부를 숨긴다.
    const rows = await client.$queryRaw<ColumnTargetView[]>`
      SELECT "type", "objectDefinitionId", "listDefinitionId" FROM "ViewDefinition"
      WHERE id = ${viewId}::uuid AND "workspaceId" = ${workspaceId}::uuid FOR UPDATE
    `;
    return rows[0] ?? null;
  }

  // 기능 : 요청 ID에 대응하는 기존 컬럼의 최소 소속 정보를 읽습니다.
  findCreation(id: string, context: TransactionContext) {
    return resolvePrismaTransactionalClient(this.prisma, context).viewAttributeSettingDefinition.findUnique({
      where: { id }, select: { id: true, workspaceId: true, viewDefinitionId: true, createdByActorId: true,
        attributeDefinitionId: true, sourceScope: true, attributeDisplayRole: true, referenceAttributeIdPathJson: true },
    });
  }

  // 기능 : 잠긴 View의 표시 설정 수와 최대 순서를 같은 트랜잭션으로 집계합니다.
  async placement(workspaceId: string, viewId: string, context: TransactionContext) {
    const result = await resolvePrismaTransactionalClient(this.prisma, context).viewAttributeSettingDefinition.aggregate({
      where: { workspaceId, viewDefinitionId: viewId }, _count: true, _max: { sortOrder: true },
    });
    return { count: result._count, lastSortOrder: result._max.sortOrder };
  }

  // 기능 : 새 속성을 현재 보기의 마지막 일반 컬럼으로 저장합니다.
  async create(input: Parameters<ViewColumnCommandRepository["create"]>[0], context: TransactionContext) {
    // 1. 표시 역할과 참조 경로는 서버가 결정하고 기존 제목·다른 보기에는 쓰지 않는다.
    try {
      await resolvePrismaTransactionalClient(this.prisma, context).viewAttributeSettingDefinition.create({
        data: { ...input, sourceScope: "RECORD", attributeDisplayRole: "DISPLAY", referenceAttributeIdPathJson: [],
          isHidden: false, labelOverride: null, width: null },
      });
    } catch (error) {
      // 2. 다른 View의 동시 요청과 PK가 충돌해도 원본 DB 오류를 공개하지 않는다.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") throw new ViewColumnError("ViewColumnCreationConflict");
      throw error;
    }
  }
}

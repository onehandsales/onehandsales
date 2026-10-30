import type { RecordDataQuery } from "../../application/ports/record-data-query.port";
import type { TransactionContext } from "@/shared/application/ports/transaction-manager.port";
import { resolvePrismaTransactionalClient } from "@/shared/infrastructure/prisma/prisma-transaction-manager";
import type { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

// 역할 : Record 소유 테이블의 배치 읽기를 다른 모듈에 제공합니다.
export class PrismaRecordDataQueryRepository implements RecordDataQuery {
  // 기능 : Record delegate를 해석할 Prisma 기본 client를 주입받습니다.
  constructor(private readonly prisma: PrismaService) {}
  // 기능 : 선택 Object의 원본을 ID cursor로 제한하여 읽습니다.
  async list(
    workspaceId: string,
    objectId: string,
    afterId: string | null,
    take: number,
    context: TransactionContext,
  ) {
    const rows = await resolvePrismaTransactionalClient(
      this.prisma,
      context,
    ).recordDefinition.findMany({
      where: {
        workspaceId,
        objectDefinitionId: objectId,
        ...(afterId ? { id: { gt: afterId } } : {}),
      },
      select: { id: true, objectDefinitionId: true, createdAt: true },
      orderBy: { id: "asc" },
      take,
    });
    return rows.map((row) => ({
      ...row,
      createdAt: row.createdAt.toISOString(),
    }));
  }
  // 기능 : 연결 Record의 존재와 Object 소속을 Workspace 범위에서 확인합니다.
  async find(workspaceId: string, ids: string[], context: TransactionContext) {
    if (!ids.length) return [];
    const rows = await resolvePrismaTransactionalClient(
      this.prisma,
      context,
    ).recordDefinition.findMany({
      where: { workspaceId, id: { in: ids } },
      select: { id: true, objectDefinitionId: true, createdAt: true },
      orderBy: { id: "asc" },
    });
    return rows.map((row) => ({
      ...row,
      createdAt: row.createdAt.toISOString(),
    }));
  }
  // 기능 : 값 배열을 보존하고 Prisma Decimal·Date를 공개 문자열로 변환합니다.
  async values(
    workspaceId: string,
    ids: string[],
    attributeIds: string[],
    take: number,
    context: TransactionContext,
  ) {
    if (!ids.length || !attributeIds.length) return [];
    const rows = await resolvePrismaTransactionalClient(
      this.prisma,
      context,
    ).recordAttributeValueDefinition.findMany({
      where: {
        workspaceId,
        recordDefinitionId: { in: ids },
        attributeDefinitionId: { in: attributeIds },
      },
      orderBy: { id: "asc" },
      take,
      select: {
        id: true,
        recordDefinitionId: true,
        attributeDefinitionId: true,
        attributeType: true,
        jsonValue: true,
        textValue: true,
        numberValue: true,
        booleanValue: true,
        dateValue: true,
        timestampValue: true,
        selectOptionId: true,
        statusOptionId: true,
        targetRecordDefinitionId: true,
        targetObjectDefinitionId: true,
        targetActorId: true,
      },
    });
    return rows.map(
      ({
        recordDefinitionId,
        numberValue,
        dateValue,
        timestampValue,
        ...row
      }) => ({
        ...row,
        ownerId: recordDefinitionId,
        numberValue: numberValue?.toFixed() ?? null,
        dateValue: dateValue?.toISOString().slice(0, 10) ?? null,
        timestampValue: timestampValue?.toISOString() ?? null,
      }),
    );
  }
}

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
    // 1. Workspace와 Object를 고정하고 ID 경계 다음의 Record를 배치로 읽는다.
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
    // 2. Record 식별자와 Object 소속을 유지하고 생성 시각을 UTC 문자열로 변환한다.
    return rows.map((row) => ({
      ...row,
      createdAt: row.createdAt.toISOString(),
    }));
  }
  // 기능 : 연결 Record의 존재와 Object 소속을 Workspace 범위에서 확인합니다.
  async find(workspaceId: string, ids: string[], context: TransactionContext) {
    // 1. 빈 조회를 생략하고 같은 Workspace에서 요청한 Record의 소속만 확인한다.
    if (!ids.length) return [];
    const rows = await resolvePrismaTransactionalClient(
      this.prisma,
      context,
    ).recordDefinition.findMany({
      where: { workspaceId, id: { in: ids } },
      select: { id: true, objectDefinitionId: true, createdAt: true },
      orderBy: { id: "asc" },
    });
    // 2. 참조 검증에 필요한 최소 필드를 application 계약으로 변환한다.
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
    // 1. 요청 Record·속성의 모든 값 행을 Workspace와 같은 snapshot으로 제한한다.
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
    // 2. 다중값과 원본 소유자를 유지하고 DB 전용 Decimal·Date 타입을 제거한다.
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

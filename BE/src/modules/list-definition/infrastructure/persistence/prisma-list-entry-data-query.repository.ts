import type { ListEntryDataQuery } from "../../application/ports/list-entry-data-query.port";
import type { TransactionContext } from "@/shared/application/ports/transaction-manager.port";
import { resolvePrismaTransactionalClient } from "@/shared/infrastructure/prisma/prisma-transaction-manager";
import type { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

// 역할 : List와 Entry·EntryValue의 읽기 소유권을 유지합니다.
export class PrismaListEntryDataQueryRepository implements ListEntryDataQuery {
  // 기능 : 같은 snapshot의 List delegate를 해석합니다.
  constructor(private readonly prisma: PrismaService) {}
  // 기능 : ID-only 참조의 실제 Workspace 소속을 확인합니다.
  async exists(
    workspaceId: string,
    listId: string,
    context: TransactionContext,
  ) {
    return (
      (await resolvePrismaTransactionalClient(
        this.prisma,
        context,
      ).listDefinition.findFirst({
        where: { workspaceId, id: listId },
        select: { id: true },
      })) !== null
    );
  }
  // 기능 : 원본 Entry의 ID와 연결 Record를 제한된 배치로 반환합니다.
  async list(
    workspaceId: string,
    listId: string,
    afterId: string | null,
    take: number,
    context: TransactionContext,
  ) {
    const rows = await resolvePrismaTransactionalClient(
      this.prisma,
      context,
    ).listEntryDefinition.findMany({
      where: {
        workspaceId,
        listDefinitionId: listId,
        ...(afterId ? { id: { gt: afterId } } : {}),
      },
      select: { id: true, recordDefinitionId: true, createdAt: true },
      orderBy: { id: "asc" },
      take,
    });
    return rows.map((row) => ({
      ...row,
      createdAt: row.createdAt.toISOString(),
    }));
  }
  // 기능 : List/Entry 소속을 함께 제한하여 업무 값을 반환합니다.
  async values(
    workspaceId: string,
    listId: string,
    ids: string[],
    attributeIds: string[],
    take: number,
    context: TransactionContext,
  ) {
    if (!ids.length || !attributeIds.length) return [];
    const rows = await resolvePrismaTransactionalClient(
      this.prisma,
      context,
    ).listEntryValueDefinition.findMany({
      where: {
        workspaceId,
        listDefinitionId: listId,
        listEntryDefinitionId: { in: ids },
        attributeDefinitionId: { in: attributeIds },
      },
      orderBy: { id: "asc" },
      take,
      select: {
        id: true,
        listEntryDefinitionId: true,
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
        listEntryDefinitionId,
        numberValue,
        dateValue,
        timestampValue,
        ...row
      }) => ({
        ...row,
        ownerId: listEntryDefinitionId,
        numberValue: numberValue?.toFixed() ?? null,
        dateValue: dateValue?.toISOString().slice(0, 10) ?? null,
        timestampValue: timestampValue?.toISOString() ?? null,
      }),
    );
  }
}

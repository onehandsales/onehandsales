import type { RecordOptionsQuery } from "../../application/ports/record-options-query.port";
import type { TransactionContext } from "@/shared/application/ports/transaction-manager.port";
import { resolvePrismaReadContext } from "@/shared/infrastructure/prisma/prisma-transaction-manager";
// 역할 : Record와 원본 값으로 선택 후보를 조회합니다.
export class PrismaRecordOptionsQueryRepository implements RecordOptionsQuery {
  // 기능 : 이름 검색을 페이지 처리 전에 적용하고 허용된 제목 값만 반환합니다.
  async find(input: Parameters<RecordOptionsQuery["find"]>[0], context: TransactionContext) {
    const titles = { workspaceId: input.workspaceId, attributeDefinitionId: { in: input.titleAttributeIds } };
    const rows = await resolvePrismaReadContext(context).recordDefinition.findMany({ where: {
      workspaceId: input.workspaceId, ...(input.objectId ? { objectDefinitionId: input.objectId } : {}),
      ...(input.cursor ? { id: { gt: input.cursor } } : {}),
      ...(input.q ? { recordAttributeValueDefinitions: { some: { ...titles, OR: [
        { textValue: { contains: input.q, mode: "insensitive" as const } },
        { jsonValue: { path: ["displayName"], string_contains: input.q } },
      ] } } } : {}),
    }, orderBy: { id: "asc" }, take: input.take, select: { id: true,
      recordAttributeValueDefinitions: { where: titles, orderBy: [{ attributeDefinitionId: "asc" }, { id: "asc" }], select: { attributeDefinitionId: true, textValue: true, jsonValue: true } } } });
    return rows.map(row => ({ id: row.id, label: row.recordAttributeValueDefinitions.map(value => {
      const json = value.jsonValue;
      return value.textValue || (json && typeof json === "object" && !Array.isArray(json) && typeof json.displayName === "string" ? json.displayName : null);
    }).find(Boolean) ?? "이름 없는 기록" }));
  }
}

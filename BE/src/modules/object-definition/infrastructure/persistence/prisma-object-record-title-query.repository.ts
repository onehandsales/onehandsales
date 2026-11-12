import type { ObjectRecordTitleRepository } from "../../application/ports/object-record-title.repository";
import type { TransactionContext } from "@/shared/application/ports/transaction-manager.port";
import { resolvePrismaReadContext } from "@/shared/infrastructure/prisma/prisma-transaction-manager";
import { DomainError } from "@/shared/domain/errors/domain-error";

// 역할 : 관리 항목이 소유한 대표 이름 포인터만 조회하는 adapter입니다.
export class PrismaObjectRecordTitleQueryRepository implements ObjectRecordTitleRepository {
  // 기능 : 속성 데이터에 직접 접근하지 않고 명시 포인터를 반환합니다.
  async titles(workspaceId: string, context: TransactionContext) {
    // 1. 동일 Workspace의 명시 포인터만 제한하여 조회한다.
    const rows = await resolvePrismaReadContext(context).objectDefinition.findMany({
      where: { workspaceId, recordTitleAttributeDefinitionId: { not: null } }, orderBy: { id: "asc" }, take: 501,
      select: { id: true, recordTitleAttributeDefinitionId: true },
    });
    if (rows.length > 500) throw new DomainError("ViewDataQueryLimitExceeded", "Too many title definitions");
    return rows.flatMap(row => row.recordTitleAttributeDefinitionId
      ? [{ objectDefinitionId: row.id, attributeDefinitionId: row.recordTitleAttributeDefinitionId }] : []);
  }
}

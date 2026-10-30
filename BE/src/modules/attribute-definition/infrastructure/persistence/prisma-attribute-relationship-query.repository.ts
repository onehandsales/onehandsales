import type { AttributeRelationshipQuery } from "../../application/ports/attribute-relationship-query.port";
import type { TransactionContext } from "@/shared/application/ports/transaction-manager.port";
import { resolvePrismaReadContext } from "@/shared/infrastructure/prisma/prisma-transaction-manager";

// 역할 : 아직 독립 모듈이 없는 관계 메타데이터의 읽기를 속성 모듈에서 소유합니다.
export class PrismaAttributeRelationshipQueryRepository
  implements AttributeRelationshipQuery
{
  // 기능 : 경로의 출발·말단 속성이 참조하는 관계만 조회합니다.
  find(
    workspaceId: string,
    attributeIds: string[],
    context: TransactionContext,
  ) {
    if (!attributeIds.length) return Promise.resolve([]);
    return resolvePrismaReadContext(context).relationshipDefinition.findMany({
      where: {
        workspaceId,
        OR: [
          { sourceAttributeDefinitionId: { in: attributeIds } },
          { targetAttributeDefinitionId: { in: attributeIds } },
        ],
      },
      select: {
        sourceObjectDefinitionId: true,
        sourceAttributeDefinitionId: true,
        targetObjectDefinitionId: true,
        targetAttributeDefinitionId: true,
      },
    });
  }
}

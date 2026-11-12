import type { ViewAttributeCatalogQuery } from "../../application/ports/view-attribute-catalog-query.port";
import type { TransactionContext } from "@/shared/application/ports/transaction-manager.port";
import { resolvePrismaReadContext } from "@/shared/infrastructure/prisma/prisma-transaction-manager";
import { DomainError } from "@/shared/domain/errors/domain-error";
// 역할 : View 편집에 필요한 속성 후보를 Workspace 경계에서 제공합니다.
export class PrismaViewAttributeCatalogQueryRepository implements ViewAttributeCatalogQuery {
  // 기능 : 명시 원본의 속성만 제한하여 읽고 부분 목록을 정상 응답으로 숨기지 않습니다.
  async list(workspaceId: string, objectId: string | null, listId: string | null, context: TransactionContext) {
    const rows = await resolvePrismaReadContext(context).attributeDefinition.findMany({
      where: { workspaceId, ...(objectId ? { objectDefinitionId: objectId, listDefinitionId: null } : { OR: [{ objectDefinitionId: { not: null }, listDefinitionId: null }, ...(listId ? [{ listDefinitionId: listId, objectDefinitionId: null }] : [])] }) },
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }], take: 501,
      select: { id: true, workspaceId: true, objectDefinitionId: true, listDefinitionId: true, title: true, type: true, icon: true, isMultiselect: true, configJson: true },
    });
    if (rows.length > 500) throw new DomainError("ViewDataQueryLimitExceeded", "Too many attribute candidates");
    return rows;
  }
}

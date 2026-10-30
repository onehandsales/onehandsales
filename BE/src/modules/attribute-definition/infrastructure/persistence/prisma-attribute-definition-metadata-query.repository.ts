import type { AttributeDefinitionMetadataQuery, AttributeOptionsInput } from "@/modules/attribute-definition/application/ports/attribute-definition-metadata-query.port";
import type { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import type { TransactionContext } from "@/shared/application/ports/transaction-manager.port";
import { resolvePrismaReadContext } from "@/shared/infrastructure/prisma/prisma-transaction-manager";

const optionSelect = { id: true, workspaceId: true, attributeDefinitionId: true, title: true, color: true, sortOrder: true, createdAt: true } as const;
const optionOrder = [{ attributeDefinitionId: "asc" }, { sortOrder: "asc" }, { createdAt: "asc" }, { id: "asc" }] as const;

// 역할 : 속성 소유 모듈에서 다른 모듈에 표시 메타데이터를 제공합니다.
export class PrismaAttributeDefinitionMetadataQueryRepository implements AttributeDefinitionMetadataQuery {
  // 기능 : 속성·옵션 읽기 delegate만 주입받습니다.
  constructor(private readonly prisma: Pick<PrismaService, "attributeDefinition" | "selectOption" | "statusOption">) {}

  // 기능 : 요청 Workspace에 속하는 속성 원본만 일괄 반환합니다.
  async findAttributes(workspaceId: string, ids: string[], context?: TransactionContext) {
    // 1. 빈 ID 집합은 전체 조회로 바꾸지 않는다.
    if (!ids.length) return [];
    return (context ? resolvePrismaReadContext(context) : this.prisma).attributeDefinition.findMany({
      where: { workspaceId, id: { in: ids } }, orderBy: { id: "asc" },
      select: { id: true, workspaceId: true, objectDefinitionId: true, listDefinitionId: true, title: true, type: true, icon: true, isMultiselect: true, configJson: true },
    });
  }

  // 기능 : 전체 후보와 명시 ID의 합집합을 Workspace 안에서 읽습니다.
  async findOptions(input: AttributeOptionsInput, context?: TransactionContext) {
    const prisma = context ? resolvePrismaReadContext(context) : this.prisma;
    // 1. 옵션 종류별로 빈 집합을 생략하고 독립된 조회를 함께 실행한다.
    const [selectOptions, statusOptions] = await Promise.all([
      input.selectAttributeIds.length || input.selectOptionIds.length
        ? prisma.selectOption.findMany({
            where: { workspaceId: input.workspaceId, OR: [
              { attributeDefinitionId: { in: input.selectAttributeIds } }, { id: { in: input.selectOptionIds } },
            ] }, select: optionSelect, orderBy: [...optionOrder],
          }) : Promise.resolve([]),
      input.statusAttributeIds.length || input.statusOptionIds.length
        ? prisma.statusOption.findMany({
            where: { workspaceId: input.workspaceId, OR: [
              { attributeDefinitionId: { in: input.statusAttributeIds } }, { id: { in: input.statusOptionIds } },
            ] }, select: optionSelect, orderBy: [...optionOrder],
          }) : Promise.resolve([]),
    ]);
    return { selectOptions, statusOptions };
  }
}

import type {
  AttributeDefinitionListQuery,
  AttributeDefinitionValueType,
  WorkspaceObjectAttributeDefinitionListInput,
  WorkspaceObjectAttributeDefinitionListItem,
} from "@/modules/attribute-definition/application/ports/attribute-definition-list-query.port";
import type { AttributeDefinitionConfig } from "@/modules/attribute-definition/application/attribute-definition-config";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

// 역할 : PrismaAttributeDefinitionListQueryRepository가 AttributeDefinition 목록 조회를 Prisma로 구현합니다.
export class PrismaAttributeDefinitionListQueryRepository
  implements AttributeDefinitionListQuery
{
  // 기능 : PrismaService를 주입받아 AttributeDefinition 조회에 사용합니다.
  constructor(private readonly prismaService: PrismaService) {}

  // 기능 : 특정 Workspace ObjectDefinition에 속한 AttributeDefinition 요약 목록을 생성순으로 조회합니다.
  async listWorkspaceObjectAttributeDefinitions(
    input: WorkspaceObjectAttributeDefinitionListInput
  ): Promise<WorkspaceObjectAttributeDefinitionListItem[]> {
    // 1. Workspace와 ObjectDefinition 경계 안의 AttributeDefinition을 생성 시각과 ID 오름차순으로 조회한다.
    const attributeDefinitions =
      await this.prismaService.attributeDefinition.findMany({
        where: {
          workspaceId: input.workspaceId,
          objectDefinitionId: input.objectDefinitionId,
        },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        select: {
          id: true,
          icon: true,
          title: true,
          type: true,
          isMultiselect: true,
          configJson: true,
        },
      });

    // 2. Prisma row를 Object 목록 header row 응답 형태로 변환한다.
    return attributeDefinitions.map((attributeDefinition) => ({
      id: attributeDefinition.id,
      icon: attributeDefinition.icon,
      title: attributeDefinition.title,
      type: attributeDefinition.type as AttributeDefinitionValueType,
      isMultiselect: attributeDefinition.isMultiselect,
      config: attributeDefinition.configJson as AttributeDefinitionConfig | null,
    }));
  }
}

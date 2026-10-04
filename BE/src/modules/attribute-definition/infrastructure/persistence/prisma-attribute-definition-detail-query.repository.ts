import type {
  AttributeDefinitionDetailQuery,
  AttributeDefinitionDetailValueType,
  WorkspaceObjectAttributeDefinitionDetail,
  WorkspaceObjectAttributeDefinitionDetailInput,
} from "@/modules/attribute-definition/application/ports/attribute-definition-detail-query.port";
import type { AttributeDefinitionConfig } from "@/modules/attribute-definition/application/attribute-definition-config";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

// 역할 : PrismaAttributeDefinitionDetailQueryRepository가 AttributeDefinition 단건 조회를 Prisma로 구현합니다.
export class PrismaAttributeDefinitionDetailQueryRepository
  implements AttributeDefinitionDetailQuery
{
  // 기능 : PrismaService를 주입받아 AttributeDefinition 단건 조회에 사용합니다.
  constructor(private readonly prismaService: PrismaService) {}

  // 기능 : 특정 Workspace ObjectDefinition에 속한 AttributeDefinition 단건 정보를 조회합니다.
  async findWorkspaceObjectAttributeDefinition(
    input: WorkspaceObjectAttributeDefinitionDetailInput
  ): Promise<WorkspaceObjectAttributeDefinitionDetail | null> {
    // 1. Workspace/ObjectDefinition 경계 안의 AttributeDefinition 단건 row를 조회한다.
    const attributeDefinition =
      await this.prismaService.attributeDefinition.findFirst({
        where: {
          id: input.attributeDefinitionId,
          workspaceId: input.workspaceId,
          objectDefinitionId: input.objectDefinitionId,
        },
        select: {
          id: true,
          title: true,
          type: true,
          isMultiselect: true,
          description: true,
          icon: true,
          configJson: true,
          sortOrder: true,
        },
      });

    // 2. 조회 결과가 없으면 호출자가 not found로 변환할 수 있게 null을 반환한다.
    if (!attributeDefinition) {
      return null;
    }

    // 3. Prisma row를 AttributeDefinition 단건 응답 형태로 변환한다.
    return {
      id: attributeDefinition.id,
      title: attributeDefinition.title,
      type: attributeDefinition.type as AttributeDefinitionDetailValueType,
      isMultiselect: attributeDefinition.isMultiselect,
      description: attributeDefinition.description,
      icon: attributeDefinition.icon,
      config: attributeDefinition.configJson as AttributeDefinitionConfig | null,
      sortOrder: attributeDefinition.sortOrder,
    };
  }
}

import type {
  ObjectDefinitionSummary,
  ObjectDefinitionSummaryInput,
  ObjectDefinitionSummaryQuery,
} from "@/modules/object-definition/application/ports/object-definition-summary-query.port";
import type { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

// 역할 : Object 소유 모듈 안에서 Workspace로 제한한 단건 요약을 조회합니다.
export class PrismaObjectDefinitionSummaryQueryRepository
  implements ObjectDefinitionSummaryQuery
{
  // 기능 : Object 조회에 필요한 Prisma delegate만 주입받습니다.
  constructor(
    private readonly prismaService: Pick<PrismaService, "objectDefinition">
  ) {}

  // 기능 : 대상 ID와 Workspace가 모두 일치하는 Object 요약을 반환합니다.
  async findObjectDefinitionSummary(
    input: ObjectDefinitionSummaryInput
  ): Promise<ObjectDefinitionSummary | null> {
    // 1. 다른 Workspace의 Object가 섞이지 않도록 두 식별자를 함께 제한한다.
    return this.prismaService.objectDefinition.findFirst({
      where: {
        id: input.objectDefinitionId,
        workspaceId: input.workspaceId,
      },
      select: { id: true, singularName: true, icon: true },
    });
  }
}

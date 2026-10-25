import type {
  ListDefinitionSummary,
  ListDefinitionSummaryInput,
  ListDefinitionSummaryQuery,
} from "@/modules/list-definition/application/ports/list-definition-summary-query.port";
import type { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

// 역할 : List 소유 모듈 안에서 Workspace로 제한한 단건 요약을 조회합니다.
export class PrismaListDefinitionSummaryQueryRepository
  implements ListDefinitionSummaryQuery
{
  // 기능 : List 조회에 필요한 Prisma delegate만 주입받습니다.
  constructor(
    private readonly prismaService: Pick<PrismaService, "listDefinition">
  ) {}

  // 기능 : 대상 ID와 Workspace가 모두 일치하는 List 요약을 반환합니다.
  async findListDefinitionSummary(
    input: ListDefinitionSummaryInput
  ): Promise<ListDefinitionSummary | null> {
    // 1. 다른 Workspace의 List가 섞이지 않도록 두 식별자를 함께 제한한다.
    return this.prismaService.listDefinition.findFirst({
      where: { id: input.listDefinitionId, workspaceId: input.workspaceId },
      select: { id: true, name: true, icon: true },
    });
  }
}

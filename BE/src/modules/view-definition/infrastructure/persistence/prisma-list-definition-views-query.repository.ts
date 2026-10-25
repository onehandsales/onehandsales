import type {
  ListDefinitionViewRecord,
  ListDefinitionViewsQuery,
  WorkspaceListViewsQueryInput,
} from "@/modules/view-definition/application/ports/list-definition-views-query.port";
import type { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

// 역할 : List 소속 보기 선택 목록을 Workspace 경계 안에서 Prisma로 조회합니다.
export class PrismaListDefinitionViewsQueryRepository
  implements ListDefinitionViewsQuery
{
  // 기능 : View 소유 모듈의 조회 delegate만 주입받습니다.
  constructor(
    private readonly prismaService: Pick<PrismaService, "viewDefinition">
  ) {}

  // 기능 : List 소속 View 전체를 동률에도 일정한 저장 순서로 반환합니다.
  findWorkspaceListViews(
    input: WorkspaceListViewsQueryInput
  ): Promise<readonly ListDefinitionViewRecord[]> {
    // 1. Workspace와 대상 FK를 함께 제한하고 표시 정보만 조회한다.
    return this.prismaService.viewDefinition.findMany({
      where: {
        workspaceId: input.workspaceId,
        listDefinitionId: input.listDefinitionId,
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }, { id: "asc" }],
      select: { id: true, name: true, icon: true, type: true },
    });
  }
}

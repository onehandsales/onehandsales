import type {
  ObjectDefinitionViewRecord,
  ObjectDefinitionViewsQuery,
  WorkspaceObjectViewsQueryInput,
} from "@/modules/view-definition/application/ports/object-definition-views-query.port";
import type { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

// 역할 : Object 소속 보기 선택 목록을 Workspace 경계 안에서 Prisma로 조회합니다.
export class PrismaObjectDefinitionViewsQueryRepository
  implements ObjectDefinitionViewsQuery
{
  // 기능 : View 소유 모듈의 조회 delegate만 주입받습니다.
  constructor(
    private readonly prismaService: Pick<PrismaService, "viewDefinition">
  ) {}

  // 기능 : Object 소속 View 전체를 동률에도 일정한 저장 순서로 반환합니다.
  findWorkspaceObjectViews(
    input: WorkspaceObjectViewsQueryInput
  ): Promise<readonly ObjectDefinitionViewRecord[]> {
    // 1. Workspace와 대상 FK를 함께 제한하고 표시 정보만 조회한다.
    return this.prismaService.viewDefinition.findMany({
      where: {
        workspaceId: input.workspaceId,
        objectDefinitionId: input.objectDefinitionId,
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }, { id: "asc" }],
      select: { id: true, name: true, icon: true, type: true },
    });
  }
}

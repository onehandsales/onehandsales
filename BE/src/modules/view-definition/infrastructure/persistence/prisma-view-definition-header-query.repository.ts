import type {
  ViewDefinitionHeaderQuery,
  WorkspaceViewHeaderQueryInput,
  WorkspaceViewHeaderRecord,
} from "@/modules/view-definition/application/ports/view-definition-header-query.port";
import type { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

// 역할 : 대상별 첫 View와 현재 멤버의 즐겨찾기 상태를 Prisma로 조회합니다.
export class PrismaViewDefinitionHeaderQueryRepository
  implements ViewDefinitionHeaderQuery
{
  // 기능 : View 소유 모듈의 조회 delegate만 주입받습니다.
  constructor(
    private readonly prismaService: Pick<PrismaService, "viewDefinition">
  ) {}

  // 기능 : Workspace와 클릭 대상 안에서 저장 순서의 첫 View 요약을 반환합니다.
  async findFirstWorkspaceViewHeader(
    input: WorkspaceViewHeaderQueryInput
  ): Promise<WorkspaceViewHeaderRecord | null> {
    // 1. 클릭 대상 FK와 Workspace를 제한하고 동률에도 순서가 고정되도록 조회한다.
    const view = await this.prismaService.viewDefinition.findFirst({
      where: {
        workspaceId: input.workspaceId,
        ...(input.targetType === "OBJECT"
          ? { objectDefinitionId: input.targetId }
          : { listDefinitionId: input.targetId }),
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }, { id: "asc" }],
      select: {
        id: true,
        name: true,
        icon: true,
        type: true,
        viewFavoriteDefinitions: {
          where: {
            workspaceId: input.workspaceId,
            workspaceMemberId: input.workspaceMemberId,
          },
          select: { id: true },
          take: 1,
        },
      },
    });

    // 2. 조회 실패와 구분되는 정상적인 View 없음 상태를 전달한다.
    if (!view) {
      return null;
    }

    // 3. 즐겨찾기 존재 여부만 반환하고 Prisma relation과 내부 필드는 숨긴다.
    return {
      id: view.id,
      name: view.name,
      icon: view.icon,
      type: view.type,
      isFavorite: view.viewFavoriteDefinitions.length > 0,
    };
  }
}

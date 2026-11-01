import type {
  ViewDefinitionHeaderQuery,
  WorkspaceViewHeaderQueryInput,
  WorkspaceViewHeaderRecord,
  WorkspaceViewHeaderByIdQueryInput,
  WorkspaceViewHeaderByIdRecord,
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

  // 기능 : 두 조회 경로에서 같은 멤버·Workspace의 즐겨찾기 존재 여부만 선택합니다.
  private headerSelect(input: { workspaceId: string; workspaceMemberId: string }) {
    return { id: true, name: true, icon: true, type: true,
      viewFavoriteDefinitions: { where: { workspaceId: input.workspaceId, workspaceMemberId: input.workspaceMemberId }, select: { id: true }, take: 1 } } as const;
  }

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
      select: this.headerSelect(input),
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

  // 기능 : 정렬 순서와 관계없이 요청한 View의 두 소속과 개인 상태만 조회합니다.
  async findWorkspaceViewHeaderById(input: WorkspaceViewHeaderByIdQueryInput): Promise<WorkspaceViewHeaderByIdRecord | null> {
    // 1. 다른 Workspace의 View ID를 정상 부재와 같은 결과로 숨긴다.
    const view = await this.prismaService.viewDefinition.findFirst({
      where: { id: input.viewDefinitionId, workspaceId: input.workspaceId },
      select: { ...this.headerSelect(input), objectDefinitionId: true, listDefinitionId: true },
    });
    if (!view) return null;
    // 2. 원래 FK를 보존하고 내부 Favorite 행 대신 존재 여부만 반환한다.
    return { id: view.id, name: view.name, icon: view.icon, type: view.type,
      isFavorite: view.viewFavoriteDefinitions.length > 0, objectDefinitionId: view.objectDefinitionId, listDefinitionId: view.listDefinitionId };
  }
}
